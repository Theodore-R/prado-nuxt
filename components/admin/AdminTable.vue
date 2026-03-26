<script setup lang="ts">
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'

export interface AdminTableColumn {
  key: string
  label: string
  sortable?: boolean
  hiddenBelow?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<{
  columns: AdminTableColumn[]
  rows: Record<string, any>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  pageSize?: number
  rowLink?: (row: Record<string, any>) => string
}>(), {
  loading: false,
  searchable: true,
  searchPlaceholder: 'Rechercher...',
  emptyMessage: 'Aucun resultat',
  pageSize: 25,
  rowLink: undefined,
})

const router = useRouter()

defineSlots<{
  [key: `cell-${string}`]: (props: { row: Record<string, any>; value: any }) => any
  actions?: (props: { row: Record<string, any> }) => any
  'header-actions'?: () => any
}>()

const search = ref('')
const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)

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
      })
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

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.pageSize)))

const paginated = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})

watch([search, sortKey, sortDir], () => { page.value = 1 })

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search + header actions -->
    <div v-if="searchable || $slots['header-actions']" class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div v-if="searchable" class="relative flex-1 max-w-sm">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-prado-text-faint" />
        <input
          v-model="search"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-9 pr-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium"
        />
      </div>
      <div v-if="$slots['header-actions']" class="flex gap-2">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-prado-surface rounded-2xl border border-prado-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
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
                    <ChevronUp v-if="sortKey === col.key && sortDir === 'asc'" :size="14" />
                    <ChevronDown v-else-if="sortKey === col.key && sortDir === 'desc'" :size="14" />
                    <ChevronsUpDown v-else :size="14" class="opacity-40" />
                  </template>
                </div>
              </th>
              <th v-if="$slots.actions" class="text-right px-4 py-3 text-prado-text-secondary font-medium">
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
                  <div class="h-4 bg-prado-border/50 rounded animate-pulse" :style="{ width: `${60 + Math.random() * 40}%` }" />
                </td>
                <td v-if="$slots.actions" class="px-4 py-3">
                  <div class="h-4 w-16 bg-prado-border/50 rounded animate-pulse ml-auto" />
                </td>
              </tr>
            </template>

            <!-- Data rows -->
            <template v-else-if="paginated.length > 0">
              <tr
                v-for="(row, idx) in paginated"
                :key="idx"
                :class="[
                  'border-b border-prado-border last:border-0 hover:bg-prado-surface-hover transition-colors',
                  rowLink ? 'cursor-pointer' : '',
                ]"
                @click="rowLink && router.push(rowLink(row))"
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
              <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-4 py-8 text-center text-prado-text-muted">
                {{ emptyMessage }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalPages > 1" class="flex items-center justify-between text-sm text-prado-text-muted">
      <span>{{ filtered.length }} resultat{{ filtered.length > 1 ? 's' : '' }} — page {{ page }}/{{ totalPages }}</span>
      <div class="flex items-center gap-2">
        <button
          :disabled="page <= 1"
          class="p-1.5 rounded-lg hover:bg-prado-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
          @click="page--"
        >
          <ChevronLeft :size="16" />
        </button>
        <button
          :disabled="page >= totalPages"
          class="p-1.5 rounded-lg hover:bg-prado-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
          @click="page++"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
