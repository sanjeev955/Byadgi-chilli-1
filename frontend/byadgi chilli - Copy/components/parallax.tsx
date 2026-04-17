"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function Parallax({ children }: any) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [80, -80])

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  )
}