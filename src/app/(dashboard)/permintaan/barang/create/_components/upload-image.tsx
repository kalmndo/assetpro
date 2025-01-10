import { Button } from "@/components/ui/button";
import { SetStateAction } from "jotai";
import { Dispatch, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadImage({
  images,
  setImages
}: {
  images: any[],
  setImages: Dispatch<SetStateAction<any[]>>
}) {
  const uploadToS3 = async (image: any) => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + "/api/upload",
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
                preview: `${url}${fields.key}`,
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
        // @ts-ignore
        setImages((prev) => {
          if (prev) {
            return [...prev, { ...newImage, order: prev.length }];
          }
          return [{ ...newImage, order: 1 }];
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
    accept: {
      'image/*': []
    },
    onDrop
  })

  return (
    <div className="mt-4">
      <Button
        className="mt-4"
        variant="secondary"
        type='button'
        onClick={open}
      >
        Upload photo
      </Button>
    </div>

  )
}