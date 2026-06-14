"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Phone, FileText, HelpCircle, Building, MessageCircle, Shield, Users,
  MapPin, PieChart as PieChartIcon, Layers, Gauge, Map as MapIcon, ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, PieChart, Pie,
} from "recharts"
import api from "@/lib/api"

// Paleta alusiva por sección (coherente con la marca morada).
const COLORS = {
  emergency: "#E24B4A",  // rojo — urgencia
  institutions: "#1D9E75", // verde azulado — apoyo
  questions: "#BA7517",  // ámbar — evaluación
  responses: "#534AB7",  // morado — marca
  whatsapp: "#639922",   // verde
  information: "#378ADD", // azul
  allies: "#D4537E",     // rosa
}

const TYPE_COLORS = { "denuncia anónima": "#E24B4A", "apoyo policial": "#EF9F27", "línea mujeres": "#534AB7" }
const LEVEL_COLORS = { baja: "#639922", media: "#EF9F27", alta: "#E24B4A" }
const PHASE_COLORS = ["#EF9F27", "#BA7517", "#854F0B"]
const TOTAL_ESTADOS_MX = 32

// Cuenta ocurrencias por una clave y devuelve [{ name, value }] ordenado desc.
const groupBy = (arr, keyFn) => {
  const map = {}
  for (const item of arr) {
    const k = keyFn(item)
    if (!k) continue
    map[k] = (map[k] || 0) + 1
  }
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

export default function Dashboard() {
  const [data, setData] = useState({
    emergency: [], institutions: [], questions: [], whatsapp: [],
    allies: [], responses: [], information: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const results = await Promise.allSettled([
          api.get("emergency/"), api.get("institutions/"), api.get("survey/"),
          api.get("line/"), api.get("institutional-allies/"), api.get("response/"),
          api.get("information/"),
        ])
        const arr = (r) => (r.status === "fulfilled" && Array.isArray(r.value?.data) ? r.value.data : [])
        setData({
          emergency: arr(results[0]), institutions: arr(results[1]), questions: arr(results[2]),
          whatsapp: arr(results[3]), allies: arr(results[4]), responses: arr(results[5]),
          information: arr(results[6]),
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  // Distribuciones derivadas (cliente, sin tocar el backend).
  const charts = useMemo(() => {
    const byState = groupBy(data.emergency, (i) => cap(i.state))
    const topStates = byState.slice(0, 6)
    const restTotal = byState.slice(6).reduce((s, x) => s + x.value, 0)
    if (restTotal > 0) topStates.push({ name: "Otros", value: restTotal })

    const byType = groupBy(data.emergency, (i) => i.emergencyType)
    const byPhase = ["1", "2", "3"].map((p) => ({
      name: `Fase ${p}`,
      value: data.questions.filter((q) => String(q.phase) === p).length,
    }))
    const byLevel = ["baja", "media", "alta"].map((lv) => ({
      name: cap(lv),
      key: lv,
      value: data.responses.filter((r) => (r.level || "").toLowerCase() === lv).length,
    }))

    const coveredStates = new Set([
      ...data.emergency.map((i) => i.state).filter(Boolean),
      ...data.institutions.map((i) => i.state).filter(Boolean),
    ])
    return {
      byState, topStates, byType, byPhase, byLevel,
      coverage: coveredStates.size,
      coveragePct: Math.round((coveredStates.size / TOTAL_ESTADOS_MX) * 100),
    }
  }, [data])

  const kpis = [
    { key: "emergency", title: "Números de emergencia", count: data.emergency.length, icon: Phone, accent: COLORS.emergency, chipBg: "#FCEBEB", chipColor: "#A32D2D", url: "/emergency" },
    { key: "institutions", title: "Instituciones", count: data.institutions.length, icon: Building, accent: COLORS.institutions, chipBg: "#E1F5EE", chipColor: "#0F6E56", url: "/institutions" },
    { key: "questions", title: "Preguntas del test", count: data.questions.length, icon: HelpCircle, accent: COLORS.questions, chipBg: "#FAEEDA", chipColor: "#854F0B", url: "/survey" },
    { key: "responses", title: "Respuestas del test", count: data.responses.length, icon: Shield, accent: COLORS.responses, chipBg: "#EEEDFE", chipColor: "#3C3489", url: "/responses" },
    { key: "whatsapp", title: "Líneas WhatsApp", count: data.whatsapp.length, icon: MessageCircle, accent: COLORS.whatsapp, chipBg: "#EAF3DE", chipColor: "#3B6D11", url: "/whatsapp" },
    { key: "information", title: "Cards informativas", count: data.information.length, icon: FileText, accent: COLORS.information, chipBg: "#E6F1FB", chipColor: "#185FA5", url: "/information" },
    { key: "allies", title: "Aliados institucionales", count: data.allies.length, icon: Users, accent: COLORS.allies, chipBg: "#FBEAF0", chipColor: "#993556", url: "/institutional-allies" },
  ]

  const quickLinks = [
    { title: "Emergencias", icon: Phone, color: "#A32D2D", url: "/emergency" },
    { title: "Instituciones", icon: Building, color: "#0F6E56", url: "/institutions" },
    { title: "Test", icon: HelpCircle, color: "#854F0B", url: "/survey" },
    { title: "WhatsApp", icon: MessageCircle, color: "#3B6D11", url: "/whatsapp" },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard de administración</h1>
        <p className="text-muted-foreground">Resumen del contenido de la app móvil de apoyo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <Link href={k.url} key={k.key} className="block group">
            <Card
              className="h-full transition-transform hover:-translate-y-1 hover:shadow-lg border-l-4"
              style={{ borderLeftColor: k.accent }}
            >
              <CardContent className="pt-5">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg mb-3"
                  style={{ backgroundColor: k.chipBg, color: k.chipColor }}
                >
                  <k.icon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                </span>
                {loading
                  ? <Skeleton className="h-8 w-12" />
                  : <div className="text-3xl font-bold leading-none">{k.count}</div>}
                <div className="text-sm text-muted-foreground mt-1">{k.title}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" style={{ color: COLORS.emergency }} aria-hidden="true" />
              Emergencias por estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[240px] w-full" /> : (
              <div className="h-[240px] w-full" role="img" aria-label="Gráfica de números de emergencia por estado">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.topStates} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Bar dataKey="value" name="Emergencias" radius={[6, 6, 0, 0]} maxBarSize={40} fill={COLORS.emergency} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" style={{ color: COLORS.emergency }} aria-hidden="true" />
              Emergencias por tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[240px] w-full" /> : (
              <DonutWithLegend
                data={charts.byType}
                colorFor={(name) => TYPE_COLORS[name] || "#888780"}
                label={(n) => cap(n)}
                ariaLabel="Gráfica de emergencias por tipo"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4" style={{ color: COLORS.questions }} aria-hidden="true" />
              Preguntas por fase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[240px] w-full" /> : (
              <div className="h-[240px] w-full" role="img" aria-label="Gráfica de preguntas del test por fase">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.byPhase} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Bar dataKey="value" name="Preguntas" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {charts.byPhase.map((_, i) => <Cell key={i} fill={PHASE_COLORS[i % PHASE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="h-4 w-4" style={{ color: COLORS.responses }} aria-hidden="true" />
              Respuestas por nivel de riesgo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[240px] w-full" /> : (
              <DonutWithLegend
                data={charts.byLevel}
                colorFor={(name) => LEVEL_COLORS[name.toLowerCase()] || "#888780"}
                label={(n) => n}
                ariaLabel="Gráfica de respuestas por nivel de riesgo"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cobertura */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapIcon className="h-4 w-4" style={{ color: COLORS.institutions }} aria-hidden="true" />
              Cobertura geográfica
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {loading ? "…" : `${charts.coverage} de ${TOTAL_ESTADOS_MX} estados`}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${loading ? 0 : charts.coveragePct}%`, backgroundColor: COLORS.institutions }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {loading ? "Calculando cobertura…" : `${charts.coveragePct}% del país con al menos un número o institución registrada`}
          </p>
        </CardContent>
      </Card>

      {/* Accesos rápidos */}
      <p className="text-sm text-muted-foreground mb-3">Accesos rápidos</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((q) => (
          <Link href={q.url} key={q.title} className="block group">
            <Card className="transition-transform hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="flex items-center justify-between py-4">
                <span className="flex items-center gap-2 font-medium">
                  <q.icon className="h-5 w-5" style={{ color: q.color }} strokeWidth={2.25} aria-hidden="true" />
                  {q.title}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Dona con leyenda accesible debajo (color + valor).
function DonutWithLegend({ data, colorFor, label, ariaLabel }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-xs text-muted-foreground">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colorFor(d.name) }} />
            {label(d.name)} {d.value}
          </span>
        ))}
      </div>
      <div className="h-[200px] w-full" role="img" aria-label={ariaLabel}>
        {total === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin datos</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="none">
                {data.map((d) => <Cell key={d.name} fill={colorFor(d.name)} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
