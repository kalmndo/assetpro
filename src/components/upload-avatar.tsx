"use client"

import { LoaderCircle, Trash } from "lucide-react"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { useEffect, useState } from "react"
import { useDropzone } from 'react-dropzone';
import Image from "next/image"

export default function UploadAvatar({
  size = 'small',
  defaultImage,
  onChange
}: {
  size: 'small' | "big",
  defaultImage: string,
  onChange(id: string): void
}) {
  const [image, setImage] = useState<{ preview: string }[]>([{ preview: defaultImage }])
  const [uploading, setUploading] = useState(false)
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      // @ts-ignore
      setImage(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));

      setUploading(true)

      fetch(
        'https://assetpro.site' + '/api/upload',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filename: file?.name, contentType: file?.type }),
        }
      ).then((response) => {
        response.json().then(({ url, fields, id }) => {
          const formData = new FormData()
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value as string)
          })
          formData.append('file', file!)

          fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            body: formData,
          }).then(() => {
            onChange(id)
            setUploading(false)
            console.log("upload success")
          }).catch(() => {
            setUploading(false)
            console.log("upload error")
          })
        }).catch((v) => {
          setUploading(false)
          console.log("error", v)
        })
      }).catch(() => {
        setUploading(false)
        console.log("error")
      })
    }
  });

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => image.forEach(file => URL.revokeObjectURL(file.preview));
  }, [image]);

  const onRemoveClick = () => {
    setImage([{ preview: '' }])
  }

  return (
    <div className="space-y-2">
      <Label>Gambar</Label>
      <div className="flex justify-center">
        {image[0]?.preview ?
          <div className={`relative ${size === 'small' ? 'w-20 h-20' : "w-auto h-44"}`}>
            {uploading &&
              <div className="absolute w-full h-full bg-slate-300 z-50 opacity-50">
                <div className="flex justify-center items-center h-full">
                  <LoaderCircle className="animate-spin" />
                </div>
              </div>
            }
            {size === 'small' ?
              <Avatar className="w-20 h-20">
                <AvatarImage
                  className="w-20 h-20"
                  src={image[0].preview}
                  alt="@shadcn"
                />
              </Avatar> :
              <Image
                width={500}
                height={500}
                className="w-auto h-full"
                src={image[0].preview}
                alt="asdf"
              />
            }
            <Button
              onClick={onRemoveClick}
              type='button'
              className="absolute -top-2 -right-2 w-7 h-7 p-0"
              variant={"destructive"}>
              <Trash className="w-4 h-4" />
            </Button>
          </div>
          :
          <section className="container border border-dashed py-4 rounded-md hover:cursor-pointer">
            <div {...getRootProps({ className: 'dropzone' })}>
              <input {...getInputProps()} />
              <p className="text-sm text-center">Drag n Drop gambar atau klik untuk upload gambar</p>
            </div>
            <aside >
              {/* {thumbs} */}
            </aside>
          </section>
        }
      </div>
    </div>
  )
}
