import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "../input";
import { PlusCircle, Trash2 } from "lucide-react";

const CoustomPices = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "pieceSizes",
  });

  return (
    <div>
      <label className="block font-semibold text-gray-300 mb-1">pices</label>

      <div className="flex flex-col gap-3">
        {fields.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-center">
            <Controller
              name={`pieceSizes.${index}.value`}
              control={control}
              rules={{ required: "Pices is required" }}
              render={({ field }) => (
                <Input
                  label={`Pices ${index + 1}`}
                  placeholder="e.g., S, M, L or 250g, 1kg"
                  {...field}
                />
              )}
            />

            <button
              type="button"
              className="text-red-500 hover:text-red-700 mt-6"
              onClick={() => remove(index)}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        <button
          type="button"
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          onClick={() => append({ value: "" })}
        >
          <PlusCircle size={20} />
          Add Pices
        </button>
      </div>

      {errors?.pieceSizes && (
        <p className="text-red-500 text-xs mt-1">
          At least one piece size is required
        </p>
      )}
    </div>
  );
};

export default CoustomPices;
