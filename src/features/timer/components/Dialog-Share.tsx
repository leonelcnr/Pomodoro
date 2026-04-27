import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Copy, Check } from 'lucide-react'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const DialogShare = ({ link, codigo }: { link: string, codigo: string }) => {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10"><Share2 /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share link</DialogTitle>
                    <DialogDescription>
                        Anyone who has this link will be able to view this.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-full grid flex-1 gap-2">
                        <Label htmlFor="link" className="">
                            Link
                        </Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="link"
                                defaultValue={link}
                                readOnly
                            />
                            <Button 
                                type="button" 
                                size="icon" 
                                variant="secondary" 
                                className="px-3" 
                                onClick={() => handleCopy(link, 'link')}
                            >
                                <span className="sr-only">Copy link</span>
                                <AnimatePresence mode="wait" initial={false}>
                                    {copied === 'link' ? (
                                        <motion.div
                                            key="check"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <Check className="h-4 w-4 text-green-500" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="copy"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    </div>
                    <div className="w-full grid flex-1 gap-2">
                        <Label htmlFor="codigo" className="">
                            Codigo
                        </Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="codigo"
                                defaultValue={codigo}
                                readOnly
                            />
                            <Button 
                                type="button" 
                                size="icon" 
                                variant="secondary" 
                                className="px-3" 
                                onClick={() => handleCopy(codigo, 'codigo')}
                            >
                                <span className="sr-only">Copy codigo</span>
                                <AnimatePresence mode="wait" initial={false}>
                                    {copied === 'codigo' ? (
                                        <motion.div
                                            key="check"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <Check className="h-4 w-4 text-green-500" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="copy"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default React.memo(DialogShare);
