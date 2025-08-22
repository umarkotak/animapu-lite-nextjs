'use client'

import { useState, useEffect } from 'react'

export default function MinecraftArenaGenerator() {
  const [coordinates, setCoordinates] = useState({ x: 90, y: 142, z: -160 })
  const [dimensions, setDimensions] = useState({
    arenaWidth: 40,
    arenaHeight: 40,
    arenaDepth: 10,
    grassDepth: 3
  })
  const [obstacleSettings, setObstacleSettings] = useState({
    enableObstacles: true,
    obstacleCount: 5,
    minSize: 2,
    maxSize: 5,
    obstacleHeight: 3
  })
  const [commands, setCommands] = useState([])
  const [copiedIndex, setCopiedIndex] = useState(-1)
  const [showClearCommands, setShowClearCommands] = useState(false)

  const generateClearCommands = () => {
    const { x, y, z } = coordinates
    const { arenaWidth, arenaHeight, arenaDepth } = dimensions

    const x1 = x
    const x2 = x + arenaWidth - 1
    const y1 = y
    const y2 = y + arenaDepth - 1
    const z1 = z
    const z2 = z + arenaHeight - 1

    const clearCommands = []

    // Minecraft has a block limit of 32768 blocks per fill command
    const BLOCK_LIMIT = 32768

    // Calculate total arena volume
    const totalWidth = x2 - x1 + 1
    const totalHeight = y2 - y1 + 1
    const totalDepth = z2 - z1 + 1
    const totalBlocks = totalWidth * totalHeight * totalDepth

    if (totalBlocks <= BLOCK_LIMIT) {
      // Single command can clear everything
      clearCommands.push({
        title: "Clear Entire Arena",
        command: `/fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} minecraft:air`,
        description: `Clears all ${totalBlocks} blocks in one command`
      })
    } else {
      // Need to split into multiple commands
      // Split by Y layers first as it's usually the smallest dimension
      const maxLayerHeight = Math.floor(BLOCK_LIMIT / (totalWidth * totalDepth))

      if (maxLayerHeight >= 1) {
        // Split by Y layers
        let currentY = y1
        let layerNum = 1

        while (currentY <= y2) {
          const layerEndY = Math.min(currentY + maxLayerHeight - 1, y2)
          const layerBlocks = totalWidth * totalDepth * (layerEndY - currentY + 1)

          clearCommands.push({
            title: `Clear Layer ${layerNum}`,
            command: `/fill ${x1} ${currentY} ${z1} ${x2} ${layerEndY} ${z2} minecraft:air`,
            description: `Clears Y ${currentY} to ${layerEndY} (${layerBlocks} blocks)`
          })

          currentY = layerEndY + 1
          layerNum++
        }
      } else {
        // Even single layer is too big, split by sections
        const maxSectionWidth = Math.floor(Math.sqrt(BLOCK_LIMIT / totalHeight))

        for (let currentY = y1; currentY <= y2; currentY += Math.min(maxLayerHeight || 1, totalHeight)) {
          const layerEndY = Math.min(currentY + (maxLayerHeight || 1) - 1, y2)

          for (let currentX = x1; currentX <= x2; currentX += maxSectionWidth) {
            const sectionEndX = Math.min(currentX + maxSectionWidth - 1, x2)

            for (let currentZ = z1; currentZ <= z2; currentZ += maxSectionWidth) {
              const sectionEndZ = Math.min(currentZ + maxSectionWidth - 1, z2)

              const sectionBlocks = (sectionEndX - currentX + 1) * (layerEndY - currentY + 1) * (sectionEndZ - currentZ + 1)

              clearCommands.push({
                title: `Clear Section`,
                command: `/fill ${currentX} ${currentY} ${currentZ} ${sectionEndX} ${layerEndY} ${sectionEndZ} minecraft:air`,
                description: `Clears section (${sectionBlocks} blocks)`
              })
            }
          }
        }
      }
    }

    return clearCommands
  }

  const generateRandomObstacles = () => {
    const { x, y, z } = coordinates
    const { arenaWidth, arenaHeight, grassDepth } = dimensions
    const { obstacleCount, minSize, maxSize, obstacleHeight } = obstacleSettings

    const obstacles = []
    const obstacleBlocks = [
      'minecraft:stone',
      'minecraft:cobblestone',
      'minecraft:mossy_cobblestone',
      'minecraft:oak_log',
      'minecraft:stone_bricks',
      'minecraft:andesite',
      'minecraft:diorite',
      'minecraft:granite'
    ]

    // Available space inside the arena (excluding walls)
    const availableX = arenaWidth - 2
    const availableZ = arenaHeight - 2
    const baseY = y + grassDepth + 1

    for (let i = 0; i < obstacleCount; i++) {
      // Random size within bounds
      const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize

      // Random position ensuring obstacle fits inside arena
      const obstacleX = Math.floor(Math.random() * (availableX - size + 1)) + x + 1
      const obstacleZ = Math.floor(Math.random() * (availableZ - size + 1)) + z + 1

      // Random block type
      const blockType = obstacleBlocks[Math.floor(Math.random() * obstacleBlocks.length)]

      obstacles.push({
        x1: obstacleX,
        y1: baseY,
        z1: obstacleZ,
        x2: obstacleX + size - 1,
        y2: baseY + obstacleHeight - 1,
        z2: obstacleZ + size - 1,
        block: blockType,
        size
      })
    }

    return obstacles
  }

  const generateCommands = () => {
    const { x, y, z } = coordinates
    const { arenaWidth, arenaHeight, arenaDepth, grassDepth } = dimensions
    const { enableObstacles } = obstacleSettings

    const x1 = x
    const x2 = x + arenaWidth - 1
    const y1 = y
    const y2 = y + arenaDepth - 1
    const z1 = z
    const z2 = z + arenaHeight - 1

    const newCommands = []

    // Bedrock foundation
    newCommands.push({
      title: "Bedrock Foundation",
      command: `/fill ${x1} ${y1} ${z1} ${x2} ${y1} ${z2} minecraft:bedrock`,
      description: "Creates the bedrock base layer"
    })

    // Bedrock walls
    newCommands.push({
      title: "Front Wall",
      command: `/fill ${x1} ${y1 + 1} ${z1} ${x2} ${y2} ${z1} minecraft:bedrock`,
      description: "Creates the front bedrock wall"
    })

    newCommands.push({
      title: "Back Wall",
      command: `/fill ${x1} ${y1 + 1} ${z2} ${x2} ${y2} ${z2} minecraft:bedrock`,
      description: "Creates the back bedrock wall"
    })

    newCommands.push({
      title: "Left Wall",
      command: `/fill ${x1} ${y1 + 1} ${z1 + 1} ${x1} ${y2} ${z2 - 1} minecraft:bedrock`,
      description: "Creates the left bedrock wall"
    })

    newCommands.push({
      title: "Right Wall",
      command: `/fill ${x2} ${y1 + 1} ${z1 + 1} ${x2} ${y2} ${z2 - 1} minecraft:bedrock`,
      description: "Creates the right bedrock wall"
    })

    // Grass fill
    const grassY1 = y1 + 1
    const grassY2 = Math.min(y1 + grassDepth, y2 - 1)
    const grassX1 = x1 + 1
    const grassX2 = x2 - 1
    const grassZ1 = z1 + 1
    const grassZ2 = z2 - 1

    if (grassY2 >= grassY1 && grassX2 >= grassX1 && grassZ2 >= grassZ1) {
      newCommands.push({
        title: "Grass Fill",
        command: `/fill ${grassX1} ${grassY1} ${grassZ1} ${grassX2} ${grassY2} ${grassZ2} minecraft:grass_block`,
        description: "Fills the interior with grass blocks"
      })
    }

    // Generate random obstacles
    if (enableObstacles) {
      const obstacles = generateRandomObstacles()
      obstacles.forEach((obstacle, index) => {
        newCommands.push({
          title: `Obstacle ${index + 1} (${obstacle.size}x${obstacle.size})`,
          command: `/fill ${obstacle.x1} ${obstacle.y1} ${obstacle.z1} ${obstacle.x2} ${obstacle.y2} ${obstacle.z2} ${obstacle.block}`,
          description: `Creates a ${obstacle.size}x${obstacle.size} obstacle using ${obstacle.block.replace('minecraft:', '')}`
        })
      })
    }

    setCommands(newCommands)
  }

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(-1), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  useEffect(() => {
    generateCommands()
  }, [coordinates, dimensions, obstacleSettings])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">⛏️ Minecraft Arena Generator</h1>
            <p className="text-green-200 text-lg">Generate /fill commands to create custom arenas</p>
          </header>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
              <h2 className="text-2xl font-semibold text-white mb-6">Arena Configuration</h2>

              {/* Coordinates */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">X Coordinate</label>
                  <input
                    type="number"
                    value={coordinates.x}
                    onChange={(e) => setCoordinates({...coordinates, x: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Y Coordinate</label>
                  <input
                    type="number"
                    value={coordinates.y}
                    onChange={(e) => setCoordinates({...coordinates, y: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Z Coordinate</label>
                  <input
                    type="number"
                    value={coordinates.z}
                    onChange={(e) => setCoordinates({...coordinates, z: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                  />
                </div>
              </div>

              {/* Arena Dimensions */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Arena Width</label>
                  <input
                    type="number"
                    min="1"
                    value={dimensions.arenaWidth}
                    onChange={(e) => setDimensions({...dimensions, arenaWidth: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Arena Height</label>
                  <input
                    type="number"
                    min="1"
                    value={dimensions.arenaHeight}
                    onChange={(e) => setDimensions({...dimensions, arenaHeight: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                  />
                </div>
              </div>

              {/* Depth Settings */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Arena Depth (Wall Height)</label>
                  <input
                    type="number"
                    min="1"
                    value={dimensions.arenaDepth}
                    onChange={(e) => setDimensions({...dimensions, arenaDepth: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Grass Depth</label>
                  <input
                    type="number"
                    min="1"
                    value={dimensions.grassDepth}
                    onChange={(e) => setDimensions({...dimensions, grassDepth: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                  />
                </div>
              </div>

              {/* Obstacle Settings */}
              <div className="border-t border-green-500/30 pt-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="enableObstacles"
                    checked={obstacleSettings.enableObstacles}
                    onChange={(e) => setObstacleSettings({...obstacleSettings, enableObstacles: e.target.checked})}
                    className="w-4 h-4 text-green-600 bg-gray-800 border-green-500 rounded focus:ring-green-500"
                  />
                  <label htmlFor="enableObstacles" className="ml-2 text-sm font-medium text-green-200">
                    Generate Random Obstacles
                  </label>
                </div>

                {obstacleSettings.enableObstacles && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Obstacle Count</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={obstacleSettings.obstacleCount}
                          onChange={(e) => setObstacleSettings({...obstacleSettings, obstacleCount: parseInt(e.target.value) || 1})}
                          className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Obstacle Height</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={obstacleSettings.obstacleHeight}
                          onChange={(e) => setObstacleSettings({...obstacleSettings, obstacleHeight: parseInt(e.target.value) || 1})}
                          className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Min Size</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={obstacleSettings.minSize}
                          onChange={(e) => setObstacleSettings({...obstacleSettings, minSize: Math.min(parseInt(e.target.value) || 1, obstacleSettings.maxSize)})}
                          className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Max Size</label>
                        <input
                          type="number"
                          min="1"
                          max="15"
                          value={obstacleSettings.maxSize}
                          onChange={(e) => setObstacleSettings({...obstacleSettings, maxSize: Math.max(parseInt(e.target.value) || 1, obstacleSettings.minSize)})}
                          className="w-full px-3 py-2 bg-gray-800/80 border border-green-500/50 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => generateCommands()}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      🎲 Regenerate Obstacles
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Generated Commands</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowClearCommands(!showClearCommands)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      showClearCommands
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/50'
                    }`}
                  >
                    {showClearCommands ? '🏗️ Build Commands' : '🧹 Clear Commands'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {showClearCommands ? (
                  <>
                    {generateClearCommands().map((cmd, index) => (
                      <div key={`clear-${index}`} className="bg-red-900/30 rounded-lg p-4 space-y-2 border border-red-500/30">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-red-300">{index + 1}. {cmd.title}</h3>
                          <button
                            onClick={() => copyToClipboard(cmd.command, `clear-${index}`)}
                            className={`px-3 py-1 text-white text-xs rounded transition-colors ${
                              copiedIndex === `clear-${index}`
                                ? 'bg-green-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {copiedIndex === `clear-${index}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs text-red-200">{cmd.description}</p>
                        <div className="bg-black/50 rounded p-2 font-mono text-sm text-red-200 break-all">
                          {cmd.command}
                        </div>
                      </div>
                    ))}

                    <div className="bg-red-900/20 rounded-lg p-4 mt-4 border border-red-500/30">
                      <h3 className="font-semibold text-red-300 mb-2">⚠️ Clear Arena Instructions</h3>
                      <ul className="text-sm text-red-200 space-y-1 list-disc list-inside">
                        <li>Run clear commands in order to remove the entire arena</li>
                        <li>Commands respect Minecraft's 32,768 block limit per fill</li>
                        <li>Large arenas are automatically split into multiple commands</li>
                        <li>Make sure you have operator permissions</li>
                        <li>Consider backing up your world before clearing</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    {commands.map((cmd, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-green-400">{index + 1}. {cmd.title}</h3>
                          <button
                            onClick={() => copyToClipboard(cmd.command, index)}
                            className={`px-3 py-1 text-white text-xs rounded transition-colors ${
                              copiedIndex === index
                                ? 'bg-green-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {copiedIndex === index ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">{cmd.description}</p>
                        <div className="bg-black/50 rounded p-2 font-mono text-sm text-green-300 break-all">
                          {cmd.command}
                        </div>
                      </div>
                    ))}

                    {/* Usage Instructions */}
                    <div className="bg-blue-900/30 rounded-lg p-4 mt-4 border border-blue-500/30">
                      <h3 className="font-semibold text-blue-300 mb-2">📝 Build Arena Instructions</h3>
                      <ol className="text-sm text-blue-200 space-y-1 list-decimal list-inside">
                        <li>Run commands in order from top to bottom</li>
                        <li>Make sure you have operator permissions</li>
                        <li>Use in creative mode for best results</li>
                        <li>Consider the terrain before placing the arena</li>
                      </ol>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Arena Preview */}
          <div className="mt-8 bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h2 className="text-2xl font-semibold text-white mb-4">Arena Structure</h2>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-400 mb-2">🟫 Bedrock Foundation</h3>
                <p className="text-gray-300">Single layer base at Y level</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-400 mb-2">🧱 Bedrock Walls</h3>
                <p className="text-gray-300">Surrounding walls with specified height</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">🌱 Grass Fill</h3>
                <p className="text-gray-300">Interior filled with grass blocks</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-400 mb-2">🪨 Random Obstacles</h3>
                <p className="text-gray-300">Various blocks scattered for cover</p>
              </div>
            </div>

            {obstacleSettings.enableObstacles && (
              <div className="mt-4 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <h3 className="font-semibold text-purple-300 mb-2">🎲 Obstacle Blocks Used</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Stone', 'Cobblestone', 'Mossy Cobblestone', 'Oak Log', 'Stone Bricks', 'Andesite', 'Diorite', 'Granite'].map(block => (
                    <span key={block} className="px-2 py-1 bg-purple-700/50 rounded text-purple-200">{block}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}