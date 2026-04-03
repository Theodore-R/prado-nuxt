<script setup lang="ts">
import { computed, ref, watch, resolveComponent } from 'vue'
import { useCsvExport } from '../../composables/useCsvExport'

export interface PrDataTableColumn {
  key: string
  label: string
  sortable?: boolean
  hiddenBelow?: 'sm' | 'md' | 'lg' | 'xl'
  exportLabel?: string
}

interface Props {
  columns: PrDataTableColumn[]
  rows: Record<string, unknown>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  pageSize?: number
  exportable?: boolean
  exportFilename?: string
  virtualScroll?: boolean
  virtualItemHeight?: number
  /** When provided, each row becomes a clickable link. Receives the row and must return a route path. */
  rowLink?: (row: Record<string, unknown>) => string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchable: true,
  searchPlaceholder: 'Rechercher...',
  emptyMessage: 'Aucun resultat',
  pageSize: 25,
  exportable: false,
  exportFilename: 'export.csv',
  virtualScroll: false,
  virtualItemHeight: 48,
  rowLink: undefined,
})

defineSlots<{
  [key: `cell-${string}`]: (props: { row: Record<string, unknown>; value: unknown }) => unknown
  actions?: (props: { row: Record<string, unknown> }) => unknown
  toolbar?: () => unknown
}>()

const { exportCsv } = useCsvExport()

const search = ref('')
const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)

// Virtual scroll state
const scrollContainer = ref<HTMLDivElement>()
const scrollTop = ref(0)

const hiddenClass: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
}

const filtered = computed(() => {
  let result = props.rows
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(row =>
      props.columns.some(col => {
        const val = row[col.key]
        return val != null && String(val).toLowerCase().includes(q)
      }),
    )
  }
  if (sortKey.value) {
    const key = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    result = [...result].sort((a, b) => {
      const va = a[key] ?? ''
      const vb = b[key] ?? ''
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb), 'fr') * dir
    })
  }
  return result
})

const totalPages = computed(() => {
  if (props.virtualScroll) return 1
  return Math.max(1, Math.ceil(filtered.value.length / props.pageSize))
})

const paginated = computed(() => {
  if (props.virtualScroll) return filtered.value
  const start = (page.value - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})

// Virtual scroll computed properties
const virtualTotalHeight = computed(() =>
  props.virtualScroll ? filtered.value.length * props.virtualItemHeight : 0,
)

const virtualVisibleRange = computed(() => {
  if (!props.virtualScroll) return { start: 0, end: paginated.value.length }
  const containerHeight = scrollContainer.value?.clientHeight ?? 600
  const overscan = 5
  const start = Math.max(0, Math.floor(scrollTop.value / props.virtualItemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / props.virtualItemHeight) + overscan * 2
  const end = Math.min(filtered.value.length, start + visibleCount)
  return { start, end }
})

const virtualVisibleRows = computed(() => {
  if (!props.virtualScroll) return paginated.value
  return filtered.value.slice(virtualVisibleRange.value.start, virtualVisibleRange.value.end)
})

const virtualOffsetTop = computed(() =>
  props.virtualScroll ? virtualVisibleRange.value.start * props.virtualItemHeight : 0,
)

watch([search, sortKey, sortDir], () => {
  page.value = 1
  scrollTop.value = 0
})

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function handleScroll(event: Event) {
  if (!props.virtualScroll) return
  const target = event.target as HTMLDivElement
  scrollTop.value = target.scrollTop
}

function handleExport() {
  const headers = props.columns.map(col => col.exportLabel ?? col.label)
  const csvRows = filtered.value.map(row =>
    props.columns.map(col => String(row[col.key] ?? '')),
  )
  exportCsv(props.exportFilename, headers, csvRows)
}

const emit = defineEmits<{
  'row-click': [row: Record<string, unknown>]
}>()

function handleRowClick(row: Record<string, unknown>) {
  if (props.rowLink) {
    emit('row-click', row)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar: search + export + custom actions -->
    <div
      v-if="searchable || exportable || $slots.toolbar"
      class="flex flex-col sm:flex-row sm:items-center gap-3"
    >
      <div v-if="searchable" class="relative flex-1 max-w-sm">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prado-text-faint"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="search"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-9 pr-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium"
        />
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <slot name="toolbar" />

        <button
          v-if="exportable"
          type="button"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-prado-text border border-prado-border hover:bg-prado-surface-hover transition-colors"
          @click="handleExport"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exporter CSV
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-prado-surface rounded-2xl border border-prado-border overflow-hidden">
      <div
        ref="scrollContainer"
        class="overflow-x-auto"
        :class="virtualScroll ? 'overflow-y-auto' : ''"
        :style="virtualScroll ? 'max-height: 600px' : ''"
        @scroll="handleScroll"
      >
        <table class="w-full text-sm">
          <thead class="sticky top-0 z-10" :style="virtualScroll ? 'background-color: var(--prado-surface)' : ''">
            <tr class="border-b border-prado-border">
              <th
                v-for="col in columns"
                :key="col.key"
                :class="[
                  'text-left px-4 py-3 text-prado-text-secondary font-medium',
                  col.hiddenBelow ? hiddenClass[col.hiddenBelow] : '',
                  col.sortable ? 'cursor-pointer select-none hover:text-prado-text' : '',
                ]"
                @click="col.sortable && toggleSort(col.key)"
              >
                <div class="flex items-center gap-1">
                  {{ col.label }}
                  <template v-if="col.sortable">
                    <svg
                      v-if="sortKey === col.key && sortDir === 'asc'"
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m18 15-6-6-6 6" />
                    </svg>
                    <svg
                      v-else-if="sortKey === col.key && sortDir === 'desc'"
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
                    </svg>
                    <svg
                      v-else
                      class="w-3.5 h-3.5 opacity-40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 15 5 5 5-5M7 9l5-5 5 5" />
                    </svg>
                  </template>
                </div>
              </th>
              <th
                v-if="$slots.actions"
                class="text-right px-4 py-3 text-prado-text-secondary font-medium"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton loader -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="n" class="border-b border-prado-border last:border-0">
                <td
                  v-for="col in columns"
                  :key="col.key"
                  :class="['px-4 py-3', col.hiddenBelow ? hiddenClass[col.hiddenBelow] : '']"
                >
                  <div
                    class="h-4 bg-prado-border/50 rounded animate-pulse"
                    :style="{ width: `${65 + ((n * 17 + columns.indexOf(col) * 31) % 30)}%` }"
                  />
                </td>
                <td v-if="$slots.actions" class="px-4 py-3">
                  <div class="h-4 w-16 bg-prado-border/50 rounded animate-pulse ml-auto" />
                </td>
              </tr>
            </template>

            <!-- Virtual scroll spacer -->
            <template v-else-if="virtualScroll && virtualVisibleRows.length > 0">
              <tr v-if="virtualOffsetTop > 0" aria-hidden="true">
                <td
                  :colspan="columns.length + ($slots.actions ? 1 : 0)"
                  :style="{ height: `${virtualOffsetTop}px`, padding: 0 }"
                />
              </tr>
              <tr
                v-for="(row, idx) in virtualVisibleRows"
                :key="virtualVisibleRange.start + idx"
                class="border-b border-prado-border last:border-0 hover:bg-prado-surface-hover transition-colors"
                :style="{ height: `${virtualItemHeight}px` }"
              >
                <td
                  v-for="col in columns"
                  :key="col.key"
                  :class="['px-4 py-3', col.hiddenBelow ? hiddenClass[col.hiddenBelow] : '']"
                >
                  <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                    <span class="text-prado-text">{{ row[col.key] ?? '-' }}</span>
                  </slot>
                </td>
                <td v-if="$slots.actions" class="px-4 py-3">
                  <div class="flex items-center justify-end gap-2">
                    <slot name="actions" :row="row" />
                  </div>
                </td>
              </tr>
              <tr
                v-if="virtualTotalHeight - virtualOffsetTop - virtualVisibleRows.length * virtualItemHeight > 0"
                aria-hidden="true"
              >
                <td
                  :colspan="columns.length + ($slots.actions ? 1 : 0)"
                  :style="{
                    height: `${virtualTotalHeight - virtualOffsetTop - virtualVisibleRows.length * virtualItemHeight}px`,
                    padding: 0,
                  }"
                />
              </tr>
            </template>

            <!-- Standard data rows -->
            <template v-else-if="paginated.length > 0">
              <tr
                v-for="(row, idx) in paginated"
                :key="idx"
                :class="[
                  'border-b border-prado-border last:border-0 hover:bg-prado-surface-hover transition-colors',
                  rowLink ? 'cursor-pointer' : '',
                ]"
                @click="rowLink && handleRowClick(row)"
              >
                <td
                  v-for="col in columns"
                  :key="col.key"
                  :class="['px-4 py-3', col.hiddenBelow ? hiddenClass[col.hiddenBelow] : '']"
                >
                  <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                    <span class="text-prado-text">{{ row[col.key] ?? '-' }}</span>
                  </slot>
                </td>
                <td v-if="$slots.actions" class="px-4 py-3">
                  <div class="flex items-center justify-end gap-2">
                    <slot name="actions" :row="row" />
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <tr v-else>
              <td
                :colspan="columns.length + ($slots.actions ? 1 : 0)"
                class="px-4 py-8 text-center text-prado-text-muted"
              >
                {{ emptyMessage }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination (hidden when virtual scroll) -->
    <div
      v-if="!loading && !virtualScroll && totalPages > 1"
      class="flex items-center justify-between text-sm text-prado-text-muted"
    >
      <span>{{ filtered.length }} resultat{{ filtered.length > 1 ? 's' : '' }} — page {{ page }}/{{ totalPages }}</span>
      <div class="flex items-center gap-2">
        <button
          :disabled="page <= 1"
          class="p-1.5 rounded-lg hover:bg-prado-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
          @click="page--"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7" />
          </svg>
        </button>
        <button
          :disabled="page >= totalPages"
          class="p-1.5 rounded-lg hover:bg-prado-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
          @click="page++"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Row count for virtual scroll -->
    <div
      v-if="!loading && virtualScroll"
      class="text-sm text-prado-text-muted"
    >
      {{ filtered.length }} resultat{{ filtered.length > 1 ? 's' : '' }}
    </div>
  </div>
</template>
