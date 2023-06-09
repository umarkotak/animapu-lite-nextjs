export default function Onvif() {
  var n = 4

  for (let i = 1; i <= n; i++) {
    var res = ""
    for (let j = 1; j <= n+3; j++) {
      var str = `${j}`
      if (j === i+1 || j === i+2) { str = "#" }
      res = `${res}${str}`
    }
    console.log(res)
  }

  return (
    <div className="min-h-screen pb-60 bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <span className="px-4 mb-4 text-white text-xl">Onvif</span>
        </div>
      </div>
    </div>
  )
}
