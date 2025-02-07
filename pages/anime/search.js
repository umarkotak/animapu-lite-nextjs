import { useState, useEffect } from 'react'

import animapuApi from "../../apis/AnimapuApi"
import { toast } from 'react-toastify'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import MangaCardV2 from '@/components/MangaCardV2'
import { useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import Select from 'react-select'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import AnimeSeasonCard from '@/components/AnimeSeasonCard'

var tempAllMangas = []
var limit = 16

export default function AnimeSeason() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [seasonFilters, setSeasonFilters] = useState([])
  const [animePerSeasons, setAnimePerSeasons] = useState([{animes: []}])
  const [selectedSeason, setSelectedSeason] = useState({})

  useEffect(() => {
    if (!window) { return }

    var tmpSeasonFilters = []

    var allSeasonContents = generateSeasonData(1999, "fall", 2025, "winter")

    allSeasonContents.forEach((oneSeasonContent) => {
      tmpSeasonFilters.push({
        value: `${oneSeasonContent.year} - ${oneSeasonContent.season_name}`,
        label: `${oneSeasonContent.year} - ${oneSeasonContent.season_name}`,
        season_name: oneSeasonContent.season_name,
        year: oneSeasonContent.year,
      })
    })

    setSeasonFilters(tmpSeasonFilters)
  }, [])

  function generateSeasonData(minYear, minSeason, maxYear, maxSeason) {
    const seasons = ["winter", "spring", "summer", "fall"]
    var data = [];

    for (let year = maxYear; year >= minYear; year--) {
      let startSeasonIndex = 0;
      let endSeasonIndex = seasons.length - 1;

      if (year === minYear) {
        startSeasonIndex = seasons.indexOf(minSeason);
      }

      if (year === maxYear) {
        endSeasonIndex = seasons.indexOf(maxSeason);
      }

      for (let i = endSeasonIndex; i >=startSeasonIndex ; i--) {
        data.push({
          year: year,
          season_name: seasons[i],
        });
      }
    }

    return data;
  }

  useEffect(() => {
    if (!seasonFilters || seasonFilters.length === 0) {
      return
    }

    var year = searchParams.get('year') || seasonFilters[0].year
    var season = searchParams.get('season') || seasonFilters[0].season_name

    GetAnimesBySeason(year, season, 0)
  }, [seasonFilters, searchParams])

  async function GetAnimesBySeason(year, season, iter) {
    if (iter >= 10) {
      toast.error("error get season")
      return
    }

    try {
      const response = await animapuApi.GetAnimesBySeason({
        anime_source: params.anime_source,
        year: year,
        season: season
      })
      const body = await response.json()
      if (response.status !== 200) {
        console.log("error", body)
        return
      }
      setAnimePerSeasons([body.data])
      setSelectedSeason({
        value: `${year} - ${season}`,
        label: `${year} - ${season}`,
        season_name: season,
        year: year,
      })

    } catch (e) {
      toast.error(`error get season, ${year}, ${season}. ${iter}`)
      // GetAnimesBySeason(year, season, iter + 1)
    }
  }

  function handleChange(selectedOption) {
    router.push(`/animes/${params.anime_source}/season?year=${selectedOption.year}&season=${selectedOption.season_name}`)
  }

  function SeasonIconGenerator(seasonName) {
    if (seasonName === "winter") { return "fa-solid fa-snowflake" }
    if (seasonName === "spring") { return "fa-solid fa-fan" }
    if (seasonName === "summer") { return "fa-solid fa-sun" }
    if (seasonName === "fall") { return "fa-solid fa-leaf" }
    return "fa-solid fa-border-all"
  }

  function prevSeason() {
    var currIndex = 0

    if (!searchParams.get('year') && !searchParams.get('season')) {
      return
    }

    seasonFilters.forEach((val, idx) => {
      if (`${val.year}` === searchParams.get('year') && val.season_name === searchParams.get('season')) {
        currIndex = idx
      }
    })

    if (currIndex <= 0) {
      return
    }

    router.push(`/anime/season?year=${seasonFilters[currIndex-1].year}&season=${seasonFilters[currIndex-1].season_name}`)
  }

  function nextSeason() {
    var currIndex = 0

    if (!searchParams.get('year') && !searchParams.get('season')) {
      console.log("a")
      router.push(`/anime/season?year=${seasonFilters[1].year}&season=${seasonFilters[1].season_name}`)
      return
    }

    seasonFilters.forEach((val, idx) => {
      if (`${val.year}` === searchParams.get('year') && val.season_name === searchParams.get('season')) {
        currIndex = idx
      }
    })

    if (currIndex >= seasonFilters.length-1) {
      return
    }

    router.push(`/anime/season?year=${seasonFilters[currIndex+1].year}&season=${seasonFilters[currIndex+1].season_name}`)
  }

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
