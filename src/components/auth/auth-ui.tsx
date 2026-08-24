import type { ReactNode } from 'react'
import { Alert } from '@/components/ui/alert'
export function AuthHeading({title,children}:{title:string;children:ReactNode}){return <div className="mb-7"><h1 className="text-[26px] font-extrabold tracking-[-0.04em] text-[#171717] dark:text-[#F7F5F2]">{title}</h1><div className="mt-2 text-sm leading-6 text-[#6B6B6B] dark:text-[#B9B2AA]">{children}</div></div>}
export function AuthMessage({type='error',children}:{type?:'error'|'success';children:ReactNode}){return <Alert className={type==='error'?'mb-5 border-[#E5484D]/25 bg-[#E5484D]/8 text-[#C9363C] dark:text-[#FF8B87]':'mb-5 border-[#4E9A68]/25 bg-[#4E9A68]/8 text-[#2F7D4C] dark:text-[#86EFAC]'}>{children}</Alert>}
