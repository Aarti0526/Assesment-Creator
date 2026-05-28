import Image from "next/image";

interface SchoolInfoProps {
   name: string;
   location: string;
   logo: string;
}

export function SchoolInfo({ name, location, logo }: SchoolInfoProps) {
   return (
      <div className="flex h-20 items-center gap-3 rounded-xl bg-[#f0f0f0] px-4">
         <Image
            src={logo}
            alt={name}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full object-cover"
         />
         <div className="min-w-0 tracking-[-0.04em]">
            <p className="truncate text-base font-semibold text-neutral-900">
               {name}
            </p>
            <p className="truncate text-sm text-neutral-500">{location}</p>
         </div>
      </div>
   );
}
