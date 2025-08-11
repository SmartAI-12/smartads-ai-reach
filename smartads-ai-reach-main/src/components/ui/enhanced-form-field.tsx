import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
}

interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'select';
  placeholder?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  loading?: boolean;
}

interface CheckboxFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'checkbox';
}

interface SwitchFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'switch';
}

interface DateFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'date' | 'datetime-local' | 'time';
  min?: string;
  max?: string;
}

type EnhancedFormFieldProps<T extends FieldValues> = 
  | TextFieldProps<T>
  | TextareaFieldProps<T>
  | SelectFieldProps<T>
  | CheckboxFieldProps<T>
  | SwitchFieldProps<T>
  | DateFieldProps<T>;

export function EnhancedFormField<T extends FieldValues>(props: EnhancedFormFieldProps<T>) {
  const { control, name, label, description, disabled, required } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className={required ? 'after:content-["*"] after:text-destructive after:ml-1' : ''}>
            {label}
          </FormLabel>
          <FormControl>
            {props.type === 'textarea' ? (
              <Textarea
                placeholder={props.placeholder}
                rows={props.rows || 3}
                maxLength={props.maxLength}
                disabled={disabled || fieldState.invalid}
                className={fieldState.error ? 'border-destructive focus-visible:ring-destructive' : ''}
                {...field}
              />
            ) : props.type === 'select' ? (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger className={fieldState.error ? 'border-destructive focus:ring-destructive' : ''}>
                  <SelectValue placeholder={props.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {props.loading ? (
                    <div className="p-2">
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    props.options.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            ) : props.type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                  className={fieldState.error ? 'border-destructive data-[state=checked]:bg-destructive' : ''}
                />
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {label}
                </label>
              </div>
            ) : props.type === 'switch' ? (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {label}
                </label>
              </div>
            ) : (
              <div className="relative">
                {(props as TextFieldProps<T>).startIcon && (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {(props as TextFieldProps<T>).startIcon}
                  </div>
                )}
                <Input
                  type={props.type}
                  placeholder={props.type === 'text' || props.type === 'email' || props.type === 'password' || props.type === 'tel' || props.type === 'url' ? (props as TextFieldProps<T>).placeholder : undefined}
                  maxLength={props.type === 'text' || props.type === 'email' || props.type === 'password' || props.type === 'tel' || props.type === 'url' ? (props as TextFieldProps<T>).maxLength : undefined}
                  min={props.type === 'number' || props.type === 'date' || props.type === 'datetime-local' || props.type === 'time' ? 
                    (props as TextFieldProps<T> | DateFieldProps<T>).min : undefined}
                  max={props.type === 'number' || props.type === 'date' || props.type === 'datetime-local' || props.type === 'time' ? 
                    (props as TextFieldProps<T> | DateFieldProps<T>).max : undefined}
                  step={props.type === 'number' ? (props as TextFieldProps<T>).step : undefined}
                  disabled={disabled || fieldState.invalid}
                  className={`
                    ${(props as TextFieldProps<T>).startIcon ? 'pl-10' : ''}
                    ${(props as TextFieldProps<T>).endIcon ? 'pr-10' : ''}
                    ${fieldState.error ? 'border-destructive focus-visible:ring-destructive' : ''}
                  `}
                  {...field}
                  onChange={(e) => {
                    if (props.type === 'number') {
                      const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      field.onChange(value);
                    } else {
                      field.onChange(e.target.value);
                    }
                  }}
                />
                {(props as TextFieldProps<T>).endIcon && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {(props as TextFieldProps<T>).endIcon}
                  </div>
                )}
              </div>
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}