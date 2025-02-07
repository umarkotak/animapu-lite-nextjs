'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Select from 'react-select'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

import AnimeSourceCard from '@/components/AnimeSourceCard'
import AnimeHistoryCard from '@/components/AnimeHistoryCard'
import animapuApi from '@/apis/AnimapuApi'
import ChangeAnimeSourceModalOnly from '@/components/ChangeAnimeSourceModalOnly'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AnimeSourceHome() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle>
            THIS FEATURE IS UNDER CONSTRUCTION
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
