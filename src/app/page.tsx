'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
  cv: z.string().min(10, 'Por favor ingresa tu hoja de vida (mínimo 10 caracteres)'),
  jobDescription: z.string().min(10, 'Por favor ingresa la descripción de la vacante (mínimo 10 caracteres)'),
});

type FormData = z.infer<typeof formSchema>;

type AnalysisResult = {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  optimizedSummary: string;
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
    } catch (err) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <img 
            src="/PerfilMatchAI-logo.png" 
            alt="PerfilMatch AI Logo" 
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            PerfilMatch AI
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Analiza tu hoja de vida frente a una vacante y obtén recomendaciones para mejorar tu perfil profesional
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Ingresa tu información</CardTitle>
            <CardDescription>
              Pega tu hoja de vida y la descripción de la vacante para comenzar el análisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cv">Tu Hoja de Vida</Label>
                <Textarea
                  id="cv"
                  placeholder="Pega aquí tu hoja de vida completa..."
                  className="min-h-[200px] resize-y"
                  {...register('cv')}
                />
                {errors.cv && (
                  <p className="text-sm text-red-500">{errors.cv.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Descripción de la Vacante</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Pega aquí la descripción de la vacante que te interesa..."
                  className="min-h-[200px] resize-y"
                  {...register('jobDescription')}
                />
                {errors.jobDescription && (
                  <p className="text-sm text-red-500">{errors.jobDescription.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  'Analizar Compatibilidad'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Resultados del Análisis</CardTitle>
                <CardDescription>
                  Aquí tienes el análisis detallado de tu compatibilidad con la vacante
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Score de Compatibilidad</span>
                    <span className="text-3xl font-bold text-blue-600">{result.matchScore}%</span>
                  </div>
                  <Progress value={result.matchScore} className="h-3" />
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Habilidades Coincidentes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchingSkills.map((skill: string, index: number) => (
            <Badge key={index} variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
              {skill}
            </Badge>
          ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Habilidades Faltantes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill: string, index: number) => (
            <Badge key={index} variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
              {skill}
            </Badge>
          ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Recomendaciones para Mejorar</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {result.recommendations.map((rec: string, index: number) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                Recomendación {index + 1}
              </AccordionTrigger>
              <AccordionContent>{rec}</AccordionContent>
            </AccordionItem>
          ))}
                  </Accordion>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Resumen Profesional Optimizado</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.optimizedSummary, 'summary')}
                    >
                      {copied === 'summary' ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copied === 'summary' ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <Card className="bg-slate-50">
                    <CardContent className="pt-6">
                      <p className="text-slate-700 leading-relaxed">{result.optimizedSummary}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
