import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MunicipalityMultiSelectProps {
    options: { value: string; label: string }[]
    value: string[]
    onChange: (value: string[]) => void
    disabled?: boolean
    placeholder?: string
}

export function MunicipalityMultiSelect({
    options,
    value,
    onChange,
    disabled,
    placeholder = "Selecionar Municípios..."
}: MunicipalityMultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (currentValue: string) => {
        const isSelected = value.includes(currentValue);
        if (isSelected) {
            onChange(value.filter(item => item !== currentValue));
        } else {
            onChange([...value, currentValue]);
        }
    }

    const handleSelectAll = () => {
        if (value.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map(o => o.value));
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="group w-[320px] justify-between text-xs font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 h-auto min-h-10 py-2"
                >
                    <div className="flex flex-wrap gap-1 items-center text-left">
                        {value.length === 0 && <span className="text-slate-500">{placeholder}</span>}
                        {value.length > 0 && value.length <= 2 && (
                            value.map(val => (
                                <Badge key={val} variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-none">
                                    {options.find(o => o.value === val)?.label || val}
                                    <span
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSelect(val);
                                        }}
                                    >
                                        <X className="h-3 w-3 text-slate-500 hover:text-red-500" />
                                    </span>
                                </Badge>
                            ))
                        )}
                        {value.length > 2 && (
                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-none">
                                {value.length} selecionados
                            </Badge>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar município..." />
                    <CommandList>
                        <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="ALL_Or_NONE"
                                onSelect={handleSelectAll}
                                className="font-medium text-slate-500 dark:text-slate-400"
                            >
                                <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    value.length === options.length ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                )}>
                                    <Check className={cn("h-4 w-4")} />
                                </div>
                                {value.length === options.length ? "Desmarcar Todos" : "Selecionar Todos"}
                            </CommandItem>

                            {options.map((option) => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => handleSelect(option.value)}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        {option.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
