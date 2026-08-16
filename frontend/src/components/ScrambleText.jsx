import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function ScrambleText({ text, className = '', delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const target = { progress: 0 }
    const original = text

    const tween = gsap.to(target, {
      progress: 1,
      duration: 1.4,
      delay,
      ease: 'power1.inOut',
      onUpdate: () => {
        const revealCount = Math.floor(target.progress * original.length)
        let output = ''
        for (let i = 0; i < original.length; i++) {
          if (original[i] === ' ') {
            output += ' '
          } else if (i < revealCount) {
            output += original[i]
          } else {
            output += CHARS[Math.floor(Math.random() * CHARS.length)]
          }
        }
        el.textContent = output
      },
      onComplete: () => {
        el.textContent = original
      },
    })

    return () => tween.kill()
  }, [text, delay])

  return <span ref={ref} className={className}>{text}</span>
}

export default ScrambleText