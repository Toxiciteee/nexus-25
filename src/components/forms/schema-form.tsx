"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormSchema, Field } from "@/lib/forms/schemas";
import { cn } from "@/lib/utils";

export type FormValues = Record<string, unknown>;

export function SchemaForm({
  schema,
  initial,
  readOnly,
  onChange,
}: {
  schema: FormSchema;
  initial: FormValues;
  readOnly: boolean;
  onChange?: (values: FormValues) => void;
}) {
  const [values, setValues] = useState<FormValues>(initial);

  const update = (updater: (prev: FormValues) => FormValues) => {
    setValues((prev) => {
      const next = updater(prev);
      onChange?.(next);
      return next;
    });
  };

  const setKey = (key: string, value: unknown) =>
    update((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-8">
      {schema.sections.map((section) => (
        <section key={section.id}>
          <header className="mb-3">
            <h3 className="text-sm font-semibold text-(--color-foreground) uppercase tracking-wide">
              {section.title}
            </h3>
            {section.description && (
              <p className="text-xs text-(--color-muted-foreground) mt-0.5">
                {section.description}
              </p>
            )}
          </header>

          <div className="space-y-3">
            {section.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={values[field.key]}
                setValue={(v) => setKey(field.key, v)}
                readOnly={readOnly}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  setValue,
  readOnly,
}: {
  field: Field;
  value: unknown;
  setValue: (v: unknown) => void;
  readOnly: boolean;
}) {
  switch (field.type) {
    case "text":
      return (
        <FieldWrap label={field.label} htmlFor={field.key}>
          <Input
            id={field.key}
            value={(value as string) ?? ""}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.placeholder}
            disabled={readOnly}
          />
        </FieldWrap>
      );

    case "textarea":
      return (
        <FieldWrap label={field.label} htmlFor={field.key}>
          <Textarea
            id={field.key}
            value={(value as string) ?? ""}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows ?? 3}
            disabled={readOnly}
          />
        </FieldWrap>
      );

    case "date":
      return (
        <FieldWrap label={field.label} htmlFor={field.key}>
          <Input
            id={field.key}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => setValue(e.target.value)}
            disabled={readOnly}
          />
        </FieldWrap>
      );

    case "number":
      return (
        <FieldWrap
          label={field.unit ? `${field.label} (${field.unit})` : field.label}
          htmlFor={field.key}
        >
          <Input
            id={field.key}
            type="number"
            step={field.step}
            value={(value as string) ?? ""}
            onChange={(e) => setValue(e.target.value)}
            disabled={readOnly}
          />
        </FieldWrap>
      );

    case "radio":
      return (
        <FieldWrap label={field.label}>
          <div className="flex flex-wrap gap-2">
            {field.options.map((opt) => {
              const checked = value === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm cursor-pointer transition-colors",
                    checked
                      ? "border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary)"
                      : "border-(--color-border) hover:bg-(--color-accent)",
                    readOnly && "cursor-not-allowed opacity-70",
                  )}
                >
                  <input
                    type="radio"
                    name={field.key}
                    value={opt.value}
                    checked={checked}
                    disabled={readOnly}
                    onChange={() => setValue(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </FieldWrap>
      );

    case "checkbox-row": {
      const data = (value as Record<string, unknown> | undefined) ?? {};
      const checked = Boolean(data.checked);
      return (
        <div className="rounded-lg border bg-(--color-card) p-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <Checkbox
              checked={checked}
              disabled={readOnly}
              onChange={(e) =>
                setValue({ ...data, checked: e.target.checked })
              }
            />
            <span className="font-medium text-sm">{field.label}</span>
          </label>
          {checked && field.columns && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pl-6">
              {field.columns.map((c) => (
                <div key={c.key}>
                  <Label className="text-xs text-(--color-muted-foreground)">
                    {c.label}
                  </Label>
                  <Input
                    value={(data[c.key] as string) ?? ""}
                    onChange={(e) =>
                      setValue({ ...data, [c.key]: e.target.value })
                    }
                    placeholder={c.placeholder}
                    disabled={readOnly}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "quantitative": {
      const data = (value as Record<string, unknown> | undefined) ?? {};
      return (
        <div className="rounded-lg border bg-(--color-card) p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{field.label}</span>
            <span className="text-xs text-(--color-muted-foreground)">
              {field.milieu} · Réf. {field.reference}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-(--color-muted-foreground)">
                Concentration ({field.unit})
              </Label>
              <Input
                type="text"
                value={(data.concentration as string) ?? ""}
                onChange={(e) =>
                  setValue({ ...data, concentration: e.target.value })
                }
                placeholder="ex. 0,8"
                disabled={readOnly}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-(--color-muted-foreground)">
                Observation
              </Label>
              <Input
                type="text"
                value={(data.observation as string) ?? ""}
                onChange={(e) =>
                  setValue({ ...data, observation: e.target.value })
                }
                disabled={readOnly}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
      );
    }

    case "qualitative": {
      const data = (value as Record<string, unknown> | undefined) ?? {};
      const result = (data.result as string) ?? "";
      return (
        <div className="rounded-lg border bg-(--color-card) p-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-medium text-sm">{field.label}</span>
            <div className="flex items-center gap-1.5">
              <ToggleChip
                label="Non recherché"
                value="ns"
                current={result}
                onClick={(v) => setValue({ ...data, result: v })}
                disabled={readOnly}
                tone="neutral"
              />
              <ToggleChip
                label="Négatif"
                value="negatif"
                current={result}
                onClick={(v) => setValue({ ...data, result: v })}
                disabled={readOnly}
                tone="success"
              />
              <ToggleChip
                label="Positif"
                value="positif"
                current={result}
                onClick={(v) => setValue({ ...data, result: v })}
                disabled={readOnly}
                tone="danger"
              />
            </div>
          </div>
          {field.withConcentration && result === "positif" && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <Label className="text-xs text-(--color-muted-foreground)">
                  Concentration
                </Label>
                <Input
                  value={(data.concentration as string) ?? ""}
                  onChange={(e) =>
                    setValue({ ...data, concentration: e.target.value })
                  }
                  disabled={readOnly}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-(--color-muted-foreground)">
                  Référence / seuil
                </Label>
                <Input
                  value={(data.reference as string) ?? ""}
                  onChange={(e) =>
                    setValue({ ...data, reference: e.target.value })
                  }
                  disabled={readOnly}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    case "substance-pharma": {
      const data = (value as Record<string, unknown> | undefined) ?? {};
      const result = (data.result as string) ?? "";
      return (
        <div className="rounded-lg border bg-(--color-card) p-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="font-medium text-sm">{field.label}</p>
              <p className="text-xs text-(--color-muted-foreground)">
                Seuil : {field.seuil}
              </p>
              <ul className="text-xs text-(--color-muted-foreground) mt-1 space-y-0.5">
                {field.fenetre.map((f, i) => (
                  <li key={i}>· {f}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <ToggleChip
                label="Négatif"
                value="negatif"
                current={result}
                onClick={(v) => setValue({ ...data, result: v })}
                disabled={readOnly}
                tone="success"
              />
              <ToggleChip
                label="Positif"
                value="positif"
                current={result}
                onClick={(v) => setValue({ ...data, result: v })}
                disabled={readOnly}
                tone="danger"
              />
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

function FieldWrap({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function ToggleChip({
  label,
  value,
  current,
  onClick,
  disabled,
  tone,
}: {
  label: string;
  value: string;
  current: string;
  onClick: (v: string) => void;
  disabled: boolean;
  tone: "neutral" | "success" | "danger";
}) {
  const active = current === value;
  const tones = {
    neutral:
      "border-(--color-border) text-(--color-muted-foreground) data-[active=true]:bg-(--color-muted) data-[active=true]:text-(--color-foreground) data-[active=true]:border-(--color-foreground)/30",
    success:
      "border-(--color-border) text-(--color-success) data-[active=true]:bg-(--color-success) data-[active=true]:text-(--color-success-foreground) data-[active=true]:border-(--color-success)",
    danger:
      "border-(--color-border) text-(--color-destructive) data-[active=true]:bg-(--color-destructive) data-[active=true]:text-(--color-destructive-foreground) data-[active=true]:border-(--color-destructive)",
  };
  return (
    <button
      type="button"
      data-active={active}
      onClick={() => onClick(active ? "" : value)}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors",
        tones[tone],
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      {label}
    </button>
  );
}
