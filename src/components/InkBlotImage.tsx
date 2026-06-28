import { useEffect, useRef, useState } from 'react'

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

export function InkBlotImage({ src, alt, className, ...rest }: Props) {
  const [revealed, setRevealed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Handle cached images that fire onLoad before the component mounts
  useEffect(() => {
    if (imgRef.current?.complete) setRevealed(true)
  }, [src])

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`${revealed ? 'ink-blot-revealed' : 'ink-blot-hidden'} ${className ?? ''}`}
      onLoad={() => setRevealed(true)}
      {...rest}
    />
  )
}
