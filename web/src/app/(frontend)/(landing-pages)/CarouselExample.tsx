import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

const items = [
  {
    title: "OBA",
    image: "/oba.jpg",
    tags: ['astronomia', 'física', 'astronáutica']
  },
  {
    title: "Futuros Cursos",
    image: "/oba.jpg",
    tags: ['astronomia', 'física', 'astronáutica']
  },
]

export default function CarouselExample() {
  return (
    <div className="mt-6 w-[40%] xl:w-[30%]">
      <Carousel className="relative">
        <CarouselContent className="-ml-4">
          {items.map((item, index) => (
            <CarouselItem
              key={index}
              className="pl-4 basis-full snap-center"
            >
              <div className="bg-pink-900 h-[250px] py-10 px-6 rounded-xl shadow-md flex flex-col justify-center">
                <Image src={item.image} alt={item.title} width={1120} height={600} className="w-full h-full object-fill rounded-md" />
                <div className="flex gap-1 mt-4">
                  {item?.tags && item.tags.map(tag => (
                    <span key={tag} className="inline-block bg-pink-300 text-pink-900 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 bg-white/80 hover:bg-white text-black dark:bg-zinc-800 dark:text-white shadow" />
        <CarouselNext className="-right-4 bg-white/80 hover:bg-white text-black dark:bg-zinc-800 dark:text-white shadow" />
      </Carousel>
    </div>
  )
}
