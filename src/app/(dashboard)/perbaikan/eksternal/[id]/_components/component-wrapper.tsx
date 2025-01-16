'use client'

import { RouterOutputs } from "@/trpc/react";
import TambahKomponenDialog from "./tambah-komponen-dialog";
import TableKomponen from "./table-komponen";
import { Button } from "@/components/ui/button";
import { Download, FileIcon, Image, Send, Trash } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { ReactNode, useCallback, useState } from "react";
import Link from "next/link";
import ReceiveDialog from "./receive-dialog";

const imagesType =  ['png', 'jpg', 'jpeg']

const File = ({
  file,
  onRemove,
  canRemove
}: {
  file: {
    id: string,
    name: string,
    type: string,
    size: number,
    url: string
  },
  onRemove(id: string): void
  canRemove: boolean
}) => {
  return (
    <div className="flex items-center gap-4" >
      <div>
        {imagesType.includes(file.type) ?
          <Image color="#2A69B3" />
          :
          <FileIcon color="#2A69B3" />
        }
      </div>
      <div className="min-w-[400px]">
        <p className="text-sm font-semibold">{file.name}</p>
        <div className="flex gap-2 text-xs items-center text-gray-500">
          <p>.{file.type}</p>
          <p>•</p>
          <p>{file.size} MB</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant={"ghost"} >
          <Link href={file?.url ?? ''}>
            <Download size={16} />
          </Link>
        </Button>
        {canRemove && <Button onClick={() => onRemove(file.id)} size="icon" variant={"ghost"} >
          <Trash size={16} />
        </Button>}
      </div>

    </div>
  )
}

export default function ComponentWrapper({ data, children }: { data: RouterOutputs['perbaikanEksternal']['getById'], children: ReactNode }) {
  const [images, setImages] = useState(data.files)
  const uploadToS3 = async (image: any) => {
    try {
      const response = await fetch(
        "/api/upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: image.file.name,
            contentType: image.file.type,
          }),
        },
      );
      const { url, fields } = await response.json();

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", image.file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.upload.onprogress = (event) => {
        console.log("onprogress", event);
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, progress: percentComplete } : img,
            ),
          );
        }
      };
      xhr.onload = () => {
        console.log("onload", xhr);
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                ...img,
                name: img.file.name.split(".")[0],
                type: img.file.name.split(".")[1],
                size: img.file.size,
                url: `${url}${fields.key}`,
                status: "success" as const,
              }
              : img,
          ),
        );
      };
      xhr.onerror = () => {
        throw new Error("Upload failed");
      };
      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading to S3:", error);
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, status: "error" as const } : img,
        ),
      );
    }
  };
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const newImage = {
          id: Math.random().toString(36),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "uploading",
        };
        setImages((prev) => {
          if (prev) {
            return [...prev, { ...newImage }];
          }
          return [{ ...newImage }];
        });
        await uploadToS3(newImage);
      });

      Promise.all(uploadPromises)
        .then((v) => console.log("selesai", v))
        .catch((v) => console.log("error nich", v))
        .finally(() => console.log("finish"));
    },
    // eslint-disable-next-line
    [setImages],
  );
  const { open } = useDropzone({
    // Disable click and keydown behavior
    noClick: true,
    noKeyboard: true,
    onDrop
  })
  const onRemove = (id: string) => {
    setImages((prev) => prev.filter((v) => id !== v.id));

  }
  return (
    <>

      <div className="my-4">
        <div className="flex justify-between my-4">
          <div className="space-y-2">
            <p className="text-sm">File pendukung</p>
            {/* <p className="text-sm">{data.catatanTeknisi}</p> */}
            {images?.map((v) => (
              <File file={v} onRemove={onRemove} canRemove={data.canAddComponents} />
            ))}
          </div>
        </div>
        <div className="flex justify-between my-2 items-center">
          <p className="font-semibold text-lg">Komponen perbaikan</p>
          {data.canAddComponents &&
            <div className="flex gap-4">
              <Button onClick={open} size="sm" variant={'outline'}>
                <Send size={14} className="mr-2" />
                Upload
              </Button>
              <TambahKomponenDialog id={data.id} />
            </div>
          }
        </div>
        {children}
      </div>
      {data.canReceiveFromVendor &&
        <div className="flex justify-end space-x-4">
          <ReceiveDialog id={data.id} files={images} />
        </div>
      }
    </>
  )
}


