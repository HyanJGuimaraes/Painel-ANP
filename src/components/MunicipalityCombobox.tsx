import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

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

interface MunicipalityComboboxProps {
    options: { value: string; label: string }[]
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function MunicipalityCombobox({
    options,
    value,
    onChange,
    disabled
}: MunicipalityComboboxProps) {
    const [open, setOpen] = React.useState(false)

    // Memoize the selected label to avoid recalculation on every render
    const selectedLabel = React.useMemo(() => {
        return value && value !== "TODOS"
            ? options.find((option) => option.value === value)?.label
            : "Selecionar Município..."
    }, [options, value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-[280px] justify-between text-xs font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10"
                >
                    {selectedLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0">
                <Command>
                    <CommandInput placeholder="Buscar município..." />
                    <CommandList>
                        <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="TODOS"
                                onSelect={() => {
                                    onChange("TODOS")
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === "TODOS" ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                TODOS
                            </CommandItem>
                            {options.slice(0, 500).map((option) => ( // Validate limit implementation to avoid lag
                                <CommandItem
                                    key={option.value}
                                    value={option.label} /* Use label for search (cmdk uses this) */
                                    onSelect={(currentValue) => {
                                        // cmdk returns the value prop usually lowercased or exact text content?
                                        // actually cmdk passes the `value` prop to onSelect?
                                        // Wait, standard cmdk usage: onSelect returns the `value` prop.
                                        // But if values are complex, we might need to map back.
                                        // Here we use option.value for the real value.
                                        // To ensure correctness, let's find the option that matches the label or something.
                                        // Robust way:
                                        console.log("Selected:", option.value);
                                        onChange(option.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
