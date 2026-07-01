export interface PreEvalOption {
  value: string
  label: string
}

export const preEvalMainReasons = [
  { value: 'carraspera_frecuente', label: 'Carraspera frecuente' },
  { value: 'sensacion_flema_garganta', label: 'Sensación de flema en la garganta' },
  { value: 'ronquera_cambios_voz', label: 'Ronquera o cambios en la voz' },
  { value: 'sensacion_cuerpo_extrano', label: 'Sensación de cuerpo extraño en la garganta' },
  { value: 'tos_persistente', label: 'Tos persistente' },
  { value: 'ardor_irritacion_garganta', label: 'Ardor o irritación de garganta' },
  { value: 'dificultad_tragar', label: 'Dificultad para tragar' },
  { value: 'acidez_reflujo', label: 'Acidez o reflujo' },
  { value: 'otro', label: 'Otro' },
] as const satisfies readonly PreEvalOption[]

export const preEvalSymptomDurationOptions = [
  { value: 'lt_1mo', label: 'Menos de 1 mes' },
  { value: '1_3mo', label: '1 a 3 meses' },
  { value: '3_12mo', label: '3 a 12 meses' },
  { value: 'gt_1yr', label: 'Más de 1 año' },
] as const satisfies readonly PreEvalOption[]

export const preEvalSymptomPatternOptions = [
  { value: 'constant', label: 'Constantes' },
  { value: 'intermittent', label: 'Intermitentes' },
  { value: 'worsening', label: 'Han empeorado progresivamente' },
] as const satisfies readonly PreEvalOption[]

export const preEvalAssociatedSymptoms = [
  { value: 'carraspera_frecuente', label: 'Carraspera frecuente' },
  { value: 'aclarar_garganta_constante', label: 'Necesidad de aclarar la garganta constantemente' },
  { value: 'exceso_flema', label: 'Exceso de flema' },
  { value: 'moco_bajando_garganta', label: 'Sensación de moco bajando por la garganta' },
  { value: 'tos_seca', label: 'Tos seca' },
  { value: 'tos_nocturna', label: 'Tos nocturna' },
  { value: 'ronquera', label: 'Ronquera' },
  { value: 'perdida_fuerza_voz', label: 'Pérdida de fuerza en la voz' },
  { value: 'dolor_garganta', label: 'Dolor de garganta' },
  { value: 'sensacion_algo_atorado', label: 'Sensación de algo atorado' },
  { value: 'dificultad_tragar', label: 'Dificultad para tragar' },
  { value: 'episodios_atoramiento', label: 'Episodios de atoramiento' },
  { value: 'acidez', label: 'Acidez' },
  { value: 'regurgitacion', label: 'Regurgitación' },
  { value: 'mal_sabor_boca_despertar', label: 'Mal sabor en la boca al despertar' },
  { value: 'despertar_irritacion_garganta', label: 'Despertar con irritación de garganta' },
  { value: 'ninguno', label: 'Ninguno de los anteriores' },
] as const satisfies readonly PreEvalOption[]

export const preEvalAggravatingFactors = [
  { value: 'cafe', label: 'Café' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'bebidas_energeticas', label: 'Bebidas energéticas' },
  { value: 'gaseosas', label: 'Gaseosas' },
  { value: 'comidas_picantes', label: 'Comidas picantes' },
  { value: 'cenas_abundantes', label: 'Cenas abundantes' },
  { value: 'ninguno', label: 'Ninguno' },
] as const satisfies readonly PreEvalOption[]

export const preEvalYesNoOptions = [
  { value: 'yes', label: 'Sí' },
  { value: 'no', label: 'No' },
] as const satisfies readonly PreEvalOption[]

export const preEvalImprovementOptions = [
  { value: 'yes', label: 'Sí' },
  { value: 'partial', label: 'Parcialmente' },
  { value: 'no', label: 'No' },
] as const satisfies readonly PreEvalOption[]

export const preEvalPriorExams = [
  { value: 'endoscopia_digestiva_alta', label: 'Endoscopía digestiva alta' },
  { value: 'laringoscopia', label: 'Laringoscopía' },
  { value: 'biopsia', label: 'Biopsia' },
  { value: 'ph_metria', label: 'pH-metría' },
  { value: 'manometria', label: 'Manometría' },
  { value: 'tomografia', label: 'Tomografía' },
  { value: 'ninguno', label: 'Ninguno' },
] as const satisfies readonly PreEvalOption[]

export const preEvalAlertSigns = [
  { value: 'perdida_peso_involuntaria', label: 'Pérdida de peso involuntaria' },
  { value: 'sangrado', label: 'Sangrado' },
  { value: 'dificultad_progresiva_tragar', label: 'Dificultad progresiva para tragar' },
  { value: 'dolor_intenso_tragar', label: 'Dolor intenso al tragar' },
  { value: 'falta_aire', label: 'Falta de aire' },
  { value: 'masa_cuello', label: 'Masa en cuello' },
  { value: 'ninguno', label: 'Ninguno' },
] as const satisfies readonly PreEvalOption[]

export const preEvalConsultationExpectations = [
  { value: 'diagnostico', label: 'Diagnóstico' },
  { value: 'segunda_opinion', label: 'Segunda opinión' },
  { value: 'revision_examenes', label: 'Revisión de exámenes' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'seguimiento', label: 'Seguimiento' },
] as const satisfies readonly PreEvalOption[]

const valuesOf = (options: readonly PreEvalOption[]) => options.map((option) => option.value)

export const preEvalMainReasonValues = valuesOf(preEvalMainReasons) as [string, ...string[]]
export const preEvalAssociatedSymptomValues = valuesOf(preEvalAssociatedSymptoms) as [
  string,
  ...string[],
]
export const preEvalAggravatingFactorValues = valuesOf(preEvalAggravatingFactors) as [
  string,
  ...string[],
]
export const preEvalPriorExamValues = valuesOf(preEvalPriorExams) as [string, ...string[]]
export const preEvalAlertSignValues = valuesOf(preEvalAlertSigns) as [string, ...string[]]
export const preEvalConsultationExpectationValues = valuesOf(preEvalConsultationExpectations) as [
  string,
  ...string[],
]
