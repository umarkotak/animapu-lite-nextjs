import { useState, useEffect, useRef } from 'react'

import { toast } from 'react-toastify';
import { Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

var version = "v4.0.1"

export default function Setting() {
  const downloadFileRef = useRef(null)
  async function downloadLibrary() {
    try {
        var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
        var libraryArrayString = localStorage.getItem(listKey)
        if (libraryArrayString) {
          const blob = new Blob([libraryArrayString], {type: 'application/json'})
          const href = window.URL.createObjectURL(blob)
          const link = downloadFileRef.current
          link.download = 'library.json'
          link.href = href
          link.click()
          link.href = '#'
        }
    } catch (e) {
      console.error(e.message)
    }
  }

  var loadLibraryPayload
  async function initLibraryFile(e) {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = (e.target.result)
      loadLibraryPayload = text
    }
    reader.readAsText(e.target.files[0])
  }

  function loadLibraryFile() {
    var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
    if (loadLibraryPayload && loadLibraryPayload !== "") {
      localStorage.setItem(listKey, loadLibraryPayload)
    }

    var libraryPayload = JSON.parse(loadLibraryPayload)

    libraryPayload.map((manga) => {
      var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
      localStorage.setItem(detailKey, JSON.stringify(manga))
    })

    toast.info("Load library success!")
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-2'>
            <div>
              <Button className="w-full" onClick={() => {downloadLibrary()}}>
                <Download />
                Download
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <Input
                type="file"
                onChange={(e)=>initLibraryFile(e)}
              />
              <Button
                className="w-1/3"
                onClick={() => {loadLibraryFile()}}
              ><Upload /> Restore From File</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => {
              if(confirm("Are you sure?")) {
                localStorage.removeItem(`ANIMAPU_LITE:HISTORY:LOCAL:LIST`)
              }
              toast.info("Clear history success!")
            }}
          >Clear Local History</Button>
        </CardContent>
      </Card>

      <p className={`text-center`}>Animapu {version} | 2020 - 2025</p>

      <a className="invisible" href="#" ref={downloadFileRef} target="_blank">_</a>
    </div>
  )
}
