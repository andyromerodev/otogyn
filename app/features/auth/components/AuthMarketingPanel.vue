<script setup lang="ts">
interface AuthMarketingPanelProps {
  eyebrow: string
  title: string
  description: string
}

defineProps<AuthMarketingPanelProps>()
</script>

<template>
  <aside class="relative hidden min-h-screen overflow-hidden bg-[#216960] px-14 py-12 text-[#f7fffd] lg:grid lg:content-between">
    <div class="pointer-events-none absolute -right-20 -top-36 h-[25rem] w-[25rem] rounded-full bg-white/12" />
    <div class="pointer-events-none absolute right-[24%] top-[34%] h-[24rem] w-[24rem] rounded-full bg-white/12" />
    <div class="pointer-events-none absolute -bottom-52 -left-44 h-[30rem] w-[30rem] rounded-full bg-white/12" />
    <div class="pointer-events-none absolute bottom-[10.5rem] left-0 h-px w-full bg-white/10" />
    <div class="pointer-events-none absolute bottom-[8rem] left-0 h-[6rem] w-full opacity-25">
      <svg viewBox="0 0 900 120" preserveAspectRatio="none" class="h-full w-full">
        <polyline
          points="0,82 78,26 156,112 234,44 312,96 390,14 468,88 546,34 624,104 702,58 780,88 900,58"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
        />
      </svg>
    </div>

    <div class="relative z-10 flex items-center gap-4">
      <span class="grid h-16 w-16 place-items-center rounded-2xl border border-white/30 bg-white/15 text-lg font-black">
        ORL
      </span>
      <div>
        <p class="m-0 text-[1.75rem] font-black leading-none">OtoGyn</p>
        <p class="m-0 mt-2 text-sm font-extrabold uppercase tracking-[0.18em] text-white/60">
          Otorrinolaringologia
        </p>
      </div>
    </div>

    <div class="relative z-10 max-w-[33rem]">
      <p class="m-0 mb-6 text-sm font-extrabold uppercase tracking-[0.18em] text-white/60">
        {{ eyebrow }}
      </p>
      <h1 class="m-0 text-[3.6rem] font-black leading-[1.08]">
        {{ title }}
      </h1>
      <p class="m-0 mt-8 max-w-[30rem] text-xl leading-9 text-white/70">
        {{ description }}
      </p>
    </div>

    <ul class="relative z-10 m-0 grid list-none gap-5 p-0 text-[1.1rem] font-bold text-white/80">
      <li class="flex items-center gap-5">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-xs font-black text-white">01</span>
        Expedientes clinicos completos
      </li>
      <li class="flex items-center gap-5">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-xs font-black text-white">02</span>
        Audiogramas y resultados integrados
      </li>
      <li class="flex items-center gap-5">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-xs font-black text-white">03</span>
        Agenda inteligente por dia
      </li>
    </ul>

    <figure class="relative z-10 m-0 text-white/55">
      <blockquote class="m-0 max-w-[43rem] text-base italic leading-7">
        "Pase de perder expedientes en papel a tener todo listo antes de que entre el paciente."
      </blockquote>
      <figcaption class="mt-3 font-extrabold">Dra. Ana Garcia · ORL · CDMX</figcaption>
    </figure>
  </aside>
</template>
