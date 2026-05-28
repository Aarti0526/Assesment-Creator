import Image from "next/image";

interface EmptyStateProps {
   imageSrc: string;
   imageAlt: string;
   title: string;
   description: string;
   actionLabel?: string;
   actionIcon?: React.ReactNode;
   onAction?: () => void;
}

export function EmptyState({
   imageSrc,
   imageAlt,
   title,
   description,
   actionLabel,
   actionIcon,
   onAction,
}: EmptyStateProps) {
   return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
         <Image
            src={imageSrc}
            alt={imageAlt}
            width={300}
            height={300}
            className="mb-6 w-55 lg:w-75"
            priority
         />
         <h2 className="mb-2 text-xl font-bold text-neutral-900 tracking-[-0.04em]">
            {title}
         </h2>
         <p className="mb-8 max-w-lg text-center text-[16px] leading-relaxed text-neutral-400 tracking-[-0.04em]">
            {description}
         </p>
         {actionLabel ? (
            <div className="rounded-full bg-linear-to-b from-[#FFFFFF80] to-[#66666600] p-[1.5px]">
               <button
                  onClick={onAction}
                  className="flex h-12 items-center gap-1 rounded-full bg-neutral-900 px-7 text-base font-medium tracking-[-0.04em] text-white transition-colors hover:bg-neutral-800"
               >
                  {actionIcon}
                  {actionLabel}
               </button>
            </div>
         ) : null}
      </div>
   );
}
