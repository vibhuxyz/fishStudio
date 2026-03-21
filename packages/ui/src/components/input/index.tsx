"use client";

import React, { forwardRef, useEffect, useState } from "react";

interface BaseProps {
  label?: string;
  type?: "text" | "number" | "password" | "email" | "textarea";
  className?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = "text", className, ...props }, ref) => {
    const controlledValue = props.value;
    const defaultValue = props.defaultValue;
    const [internalValue, setInternalValue] = useState<
      string | number | readonly string[]
    >(() => (controlledValue ?? defaultValue ?? "") as string | number | readonly string[]);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setInternalValue(
          (controlledValue ?? "") as string | number | readonly string[],
        );
        return;
      }

      setInternalValue(
        (defaultValue ?? "") as string | number | readonly string[],
      );
    }, [controlledValue, defaultValue]);

    const handleChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setInternalValue(event.target.value);
      props.onChange?.(
        event as React.ChangeEvent<HTMLInputElement> &
          React.ChangeEvent<HTMLTextAreaElement>,
      );
    };

    const { defaultValue: _defaultValue, value: _value, onChange, ...restProps } =
      props;

    return (
      <div className="w-full">
        {label && (
          <label className="block font-semibold text-gray-300 mb-1">
            {label}
          </label>
        )}

        {type === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white ${className}`}
            {...(restProps as TextareaProps)}
            value={controlledValue ?? internalValue ?? ""}
            onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          />
        ) : (
          <input
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            className={`w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white ${className}`}
            {...(restProps as InputProps)}
            value={controlledValue ?? internalValue ?? ""}
            onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
          />
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
