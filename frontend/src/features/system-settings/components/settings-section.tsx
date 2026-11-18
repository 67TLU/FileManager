import { useState } from 'react';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateSettings } from '../hooks/use-system-settings';
import type { SystemSettings } from '../api/system-settings.api';

export type FieldDef = {
  key: string; label: string; help?: string;
  type: 'number' | 'text' | 'list';
  unit?: number; min?: number; max?: number; step?: number;
};

export function SettingsSection({
  title, description, fields, settings,
}: { title: string; description: string; fields: FieldDef[]; settings: SystemSettings }) {
  const update = useUpdateSettings();

  const initial = () => {
    const v: Record<string, string> = {};
    for (const f of fields) {
      const raw = settings[f.key]?.value;
      if (f.type === 'list') v[f.key] = Array.isArray(raw) ? raw.join(', ') : '';
      else if (f.type === 'number') v[f.key] = String(f.unit ? Number(raw ?? 0) / f.unit : Number(raw ?? 0));
      else v[f.key] = String(raw ?? '');
    }
    return v;
  };
  const [values, setValues] = useState<Record<string, string>>(initial);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {};
    for (const f of fields) {
      const raw = values[f.key];
      if (f.type === 'list') payload[f.key] = raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      else if (f.type === 'number') payload[f.key] = Math.round(Number(raw) * (f.unit ?? 1));
      else payload[f.key] = raw;
    }
    await update.mutateAsync(payload);
  };

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4 max-w-lg">
          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              {f.type === 'list' ? (
                <Textarea rows={3} value={values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              ) : (
                <Input type={f.type === 'number' ? 'number' : 'text'}
                  min={f.min} max={f.max} step={f.step ?? 1} value={values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              )}
              {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu thay đổi
            </Button>
            <Button type="button" variant="outline" onClick={() => setValues(initial())} disabled={update.isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />Hoàn tác
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}