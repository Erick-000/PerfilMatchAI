'use client';

import { useState, ReactNode } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Copy, CheckCircle, AlertCircle, Loader2, Sparkles, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  cv: z
    .string()
    .min(10, 'Por favor ingresa tu hoja de vida (mínimo 10 caracteres)'),
  jobDescription: z
    .string()
    .min(10, 'Por favor ingresa la descripción de la vacante (mínimo 10 caracteres)'),
});

type FormData = z.infer<typeof formSchema>;

type AnalysisResult = {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  optimizedSummary: string;
};

const VALUE_PROPS = [
  { icon: Sparkles, label: 'Análisis con IA' },
  { icon: FileText, label: 'Compatibilidad instantánea' },
  { icon: Briefcase, label: 'Resultados accionables' },
];

const glassCardClass =
  'glass-panel overflow-hidden border-white/55 bg-white/58 shadow-[0_26px_90px_rgba(15,23,42,0.12)]';

const fieldClass =
  'min-h-[280px] resize-y border-white/55 bg-white/62 text-base leading-relaxed shadow-inner shadow-slate-900/[0.03] backdrop-blur-xl transition-all duration-200 placeholder:text-slate-500/80 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-0';

const scoreTone = (score: number) => {
  if (score >= 80) {
    return {
      text: 'text-emerald-600',
      gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    };
  }

  if (score >= 60) {
    return {
      text: 'text-amber-600',
      gradient: 'from-amber-400 via-orange-400 to-rose-400',
    };
  }

  return {
    text: 'text-rose-600',
    gradient: 'from-rose-400 via-red-400 to-orange-400',
  };
};

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success('Texto copiado al portapapeles');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Error al copiar el texto');
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el análisis');
      }

      const resultData = await response.json();
      setResult(resultData);
      toast.success('Análisis completado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
      toast.error('Error al realizar el análisis');
    } finally {
      setLoading(false);
    }
  };

  const currentScoreTone = result ? scoreTone(result.matchScore) : null;

  return (
    <div className="liquid-background min-h-screen overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mx-auto grid w-full max-w-6xl items-center gap-8 py-4 lg:grid-cols-[0.85fr_1.15fr] lg:py-10">
          <div className="order-2 space-y-6 text-center lg:order-1 lg:text-left">
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                PerfilMatch AI
              </h1>
              <p className="mx-auto max-w-2xl text-pretty text-lg leading-8 text-slate-600 lg:mx-0">
                Analiza tu hoja de vida frente a una vacante y recibe una lectura clara de tu compatibilidad, brechas y próximos ajustes.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              {VALUE_PROPS.map(({ icon: Icon, label }) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="glass-chip gap-2 px-4 py-2 text-sm font-semibold"
                >
                  <Icon className="h-4 w-4 text-cyan-700" />
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="logo-glass-frame">
              <Image
                src="/PerfilMatchAI-logo.png"
                alt="PerfilMatch AI"
                width={176}
                height={176}
                priority
                className="h-32 w-32 object-contain sm:h-40 sm:w-40"
              />
            </div>
          </div>
        </header>

        <main className="space-y-9">
          <Card className={glassCardClass}>
            <CardHeader className="border-b border-white/45 bg-white/32 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="glass-icon">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
                    Ingresa tu información
                  </CardTitle>
                  <CardDescription className="text-base leading-7 text-slate-600">
                    Pega tu hoja de vida y la descripción de la vacante para comenzar el análisis.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="cv" className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <FileText className="h-4 w-4 text-cyan-700" />
                      Tu hoja de vida
                    </Label>
                    <Textarea
                      id="cv"
                      placeholder="Pega aquí tu hoja de vida completa. Incluye experiencia, educación y habilidades clave."
                      className={fieldClass}
                      {...register('cv')}
                    />
                    {errors.cv && (
                      <p className="flex items-center gap-1 text-sm font-medium text-rose-600">
                        <AlertCircle className="h-4 w-4" />
                        {errors.cv.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="jobDescription"
                      className="flex items-center gap-2 text-base font-semibold text-slate-900"
                    >
                      <Briefcase className="h-4 w-4 text-cyan-700" />
                      Descripción de la vacante
                    </Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Pega aquí la descripción completa de la vacante que te interesa."
                      className={fieldClass}
                      {...register('jobDescription')}
                    />
                    {errors.jobDescription && (
                      <p className="flex items-center gap-1 text-sm font-medium text-rose-600">
                        <AlertCircle className="h-4 w-4" />
                        {errors.jobDescription.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="group h-14 w-full rounded-xl bg-slate-950 px-8 text-base font-semibold text-white shadow-xl shadow-slate-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-cyan-900/20 md:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analizando tu perfil...
                    </>
                  ) : (
                    <>
                      Analizar compatibilidad
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="glass-panel border-rose-200/80 bg-rose-50/82 shadow-lg">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
              <AlertDescription className="text-base">{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <Card className={glassCardClass}>
              <CardHeader>
                <Skeleton className="h-10 w-2/3 bg-white/70" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-4 w-full bg-white/70" />
                <Skeleton className="h-4 w-5/6 bg-white/70" />
                <div className="grid gap-6 md:grid-cols-2">
                  <Skeleton className="h-24 rounded-xl bg-white/70" />
                  <Skeleton className="h-24 rounded-xl bg-white/70" />
                </div>
              </CardContent>
            </Card>
          )}

          {result && currentScoreTone && (
            <section className="space-y-8">
              <Card className={glassCardClass}>
                <CardHeader className="border-b border-white/45 bg-white/32 pb-8">
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
                    <Sparkles className="h-7 w-7 text-cyan-700" />
                    Resultados del análisis
                  </CardTitle>
                  <CardDescription className="text-lg leading-8 text-slate-600">
                    Una lectura enfocada de tu compatibilidad con la vacante.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-10 pt-8">
                  <div className="glass-tile space-y-5 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-normal text-slate-950">
                          Score de compatibilidad
                        </h2>
                        <p className="text-slate-600">Qué tan bien encaja tu perfil con la oportunidad.</p>
                      </div>
                      <div className="text-left md:text-right">
                        <span className={`text-5xl font-bold ${currentScoreTone.text}`}>
                          {result.matchScore}%
                        </span>
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-full bg-white/70 p-1 shadow-inner">
                      <Progress value={result.matchScore} className="h-3 bg-transparent [&>div]:bg-transparent" />
                      <div
                        className={`absolute left-1 top-1 h-3 rounded-full bg-gradient-to-r ${currentScoreTone.gradient} shadow-sm transition-all duration-1000 ease-out`}
                        style={{ width: `calc(${result.matchScore}% - 0.5rem)` }}
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/45" />

                  <div className="grid gap-6 lg:grid-cols-2">
                    <SkillPanel
                      title="Habilidades coincidentes"
                      icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
                      skills={result.matchingSkills}
                      className="border-emerald-200/70 bg-emerald-50/58 text-emerald-800"
                    />
                    <SkillPanel
                      title="Habilidades faltantes"
                      icon={<AlertCircle className="h-6 w-6 text-amber-600" />}
                      skills={result.missingSkills}
                      className="border-amber-200/70 bg-amber-50/62 text-amber-800"
                    />
                  </div>

                  <Separator className="bg-white/45" />

                  <div className="space-y-5">
                    <h2 className="flex items-center gap-3 text-xl font-bold tracking-normal text-slate-950">
                      <Sparkles className="h-6 w-6 text-cyan-700" />
                      Recomendaciones para mejorar
                    </h2>
                    <Accordion type="single" collapsible className="glass-tile overflow-hidden">
                      {result.recommendations.map((recommendation, index) => (
                        <AccordionItem
                          key={`${index}-${recommendation}`}
                          value={`item-${index}`}
                          className="border-white/45 last:border-0"
                        >
                          <AccordionTrigger className="px-5 py-5 text-left text-base font-semibold text-slate-900 transition-colors hover:bg-white/38 hover:no-underline">
                            <span className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-200/70 bg-cyan-50/78 text-sm font-bold text-cyan-800">
                                {index + 1}
                              </span>
                              Recomendación {index + 1}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-5 pt-0 text-base leading-7 text-slate-600">
                            {recommendation}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <Separator className="bg-white/45" />

                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <h2 className="flex items-center gap-3 text-xl font-bold tracking-normal text-slate-950">
                        <FileText className="h-6 w-6 text-cyan-700" />
                        Resumen profesional optimizado
                      </h2>
                      <Button
                        variant="secondary"
                        onClick={() => copyToClipboard(result.optimizedSummary, 'summary')}
                        className="glass-chip h-11 rounded-xl px-5 font-semibold"
                      >
                        {copied === 'summary' ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="glass-tile p-6 md:p-8">
                      <p className="whitespace-pre-line text-lg leading-8 text-slate-800">
                        {result.optimizedSummary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </main>

        <footer className="border-t border-white/50 py-7 text-center text-sm text-slate-600">
          PerfilMatch AI - Potenciado por inteligencia artificial
        </footer>
      </div>
    </div>
  );
}

function SkillPanel({
  title,
  icon,
  skills,
  className,
}: {
  title: string;
  icon: ReactNode;
  skills: string[];
  className: string;
}) {
  return (
    <div className="glass-tile space-y-4 p-6">
      <h2 className="flex items-center gap-3 text-xl font-bold tracking-normal text-slate-950">
        {icon}
        {title}
      </h2>
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, index) => (
          <Badge
            key={`${index}-${skill}`}
            className={`border px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-md transition-colors ${className}`}
          >
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}
