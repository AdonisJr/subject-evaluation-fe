<template>
  <div class="w-full max-w-4xl mx-auto py-2">
    <label for="file-upload"
      class="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-white transition-all duration-200"
      :class="isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave">
      
      <input id="file-upload" type="file" class="hidden" @change="onFileChange" accept=".jpg,.jpeg,.png,.pdf" />

      <!-- Content -->
      <div class="space-y-3">
        <!-- Preview -->
        <div v-if="previewUrl" class="flex flex-col items-center">
          <div v-if="isImage" class="w-32 h-32 mb-3 overflow-hidden rounded-md border border-gray-200">
            <img :src="previewUrl" alt="Preview" class="w-full h-full object-cover" />
          </div>
          <div v-else class="flex items-center justify-center w-32 h-32 mb-3 bg-gray-100 rounded-md border border-gray-200">
            <span class="text-gray-500 text-sm">📄 PDF File</span>
          </div>
        </div>

        <p class="text-gray-600">
          <span class="font-medium text-green-600">Drag and drop</span> your file here or click to browse.
        </p>

        <p v-if="fileName" class="text-gray-700 font-medium">📎 {{ fileName }}</p>
        <p v-else class="text-gray-400 text-sm">No file chosen</p>

        <!-- Action Buttons -->
        <div v-if="file" class="flex justify-center gap-2 mt-4">
          <button
            @click.prevent="emitFile"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Continue
          </button>

          <button
            type="button"
            @click="cancelUpload"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
            Cancel
          </button>
        </div>
      </div>
    </label>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"

const emits = defineEmits(["file-selected"])
const file = ref(null)
const fileName = ref("")
const previewUrl = ref("")
const isDragging = ref(false)

const isImage = computed(() => /\.(jpg|jpeg|png)$/i.test(fileName.value))

function onFileChange(e) {
  const selectedFile = e.target.files[0]
  handleFile(selectedFile)
}

function onDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const droppedFile = e.dataTransfer.files[0]
  handleFile(droppedFile)
}

function handleFile(selectedFile) {
  if (!selectedFile) return
  file.value = selectedFile
  fileName.value = selectedFile.name
  previewUrl.value = selectedFile.type.startsWith("image/") ? URL.createObjectURL(selectedFile) : ""
}

function onDragOver(e) {
  e.preventDefault()
  isDragging.value = true
}
function onDragLeave() {
  isDragging.value = false
}

function emitFile() {
  emits("file-selected", file.value)
}

function cancelUpload() {
  file.value = null
  fileName.value = ""
  previewUrl.value = ""
}
</script>
