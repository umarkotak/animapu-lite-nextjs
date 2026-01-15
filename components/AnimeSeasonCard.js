'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Img } from 'react-image'
import { Star, X, Search, Calendar, Film } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Utility to clean HTML entities from text
const cleanText = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/Judul:\s*/gi, '')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
}

// Default cover image
const DEFAULT_COVER = '/images/animehub_cover.jpeg'

export default function AnimeSeasonCard({ oneAnimeData, source }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    id,
    title = '',
    cover_urls = [DEFAULT_COVER],
    score,
    latest_episode,
    genres = [],
    release_year,
    release_season,
    description,
    alt_titles = [],
    search_title,
  } = oneAnimeData || {}

  const displayTitle = cleanText(title)
  const searchQuery = search_title || title

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      {/* Card */}
      <Card
        className="group relative overflow-hidden cursor-pointer h-[280px] sm:h-[320px] p-0 border-0"
        onClick={openModal}
      >
        {/* Cover Image */}
        <div className="absolute inset-0">
          <Img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={cover_urls}
            alt={displayTitle}
            loader={<div className="w-full h-full bg-muted animate-pulse" />}
            unloader={<div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No Image</div>}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Episode Badge */}
        {latest_episode > 0 && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs"
          >
            <Film className="h-3 w-3 mr-1" />
            {latest_episode} Eps
          </Badge>
        )}

        {/* Score Badge */}
        {score && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs"
          >
            <Star className="h-3 w-3 mr-1 fill-current" />
            {score}
          </Badge>
        )}

        {/* Bottom Content */}
        <CardContent className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-medium text-white line-clamp-2 leading-tight">
            {displayTitle}
          </h3>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <Card className="relative z-10 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Background */}
            <div
              className="h-24 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${cover_urls?.[0] || DEFAULT_COVER})` }}
            >
              <div className="absolute inset-0 backdrop-blur-md bg-black/30" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-white/20"
                onClick={closeModal}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Body */}
            <CardContent className="p-4 pt-0">
              <div className="flex gap-4">
                {/* Cover Image */}
                <div className="w-28 flex-shrink-0 -mt-12 relative z-10">
                  <Img
                    className="w-full rounded-lg border-2 border-background shadow-lg"
                    src={cover_urls}
                    alt={displayTitle}
                  />
                  <a
                    href={`https://hianime.to/search?keyword=${encodeURIComponent(searchQuery).replace(/%20/g, '+')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-1 w-full py-2 rounded-lg border bg-primary hover:bg-primary/90 text-primary-foreground text-xs transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Search className="h-3 w-3" />
                    Watch on HiAnime
                  </a>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-2">
                  <h2 className="text-lg font-semibold line-clamp-2 leading-tight">
                    {displayTitle}
                  </h2>

                  {/* Meta Info */}
                  {(release_year || release_season) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>{release_year} - {release_season}</span>
                    </div>
                  )}

                  {/* Score */}
                  {score && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{score}</span>
                    </div>
                  )}

                  {/* Genres */}
                  {genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {genres.slice(0, 5).map((genre) => (
                        <Badge key={genre} variant="outline" className="text-[10px] px-2 py-0">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {description && (
                <p className="text-xs text-muted-foreground line-clamp-4 mt-4">
                  {cleanText(description)}
                </p>
              )}

              {/* Alternative Titles */}
              {alt_titles?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">
                    Alternative Titles
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {alt_titles.slice(0, 3).map((altTitle, idx) => (
                      <li key={idx} className="truncate">• {cleanText(altTitle)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
