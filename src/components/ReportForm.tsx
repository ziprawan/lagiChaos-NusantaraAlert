"use client";

import { DisasterType } from "@/types/disaster";
import { Camera, FileText, MapPin, PlusCircle, Send, X } from "lucide-react";
import { useState } from "react";

const disasterTypesForForm: { value: DisasterType; label: string }[] = [
  { value: "flood", label: "Banjir" },
  { value: "earthquake", label: "Gempa Bumi" },
  { value: "volcano", label: "Gunung Berapi" },
  { value: "tornadoes", label: "Angin Puting Beliung" },
];

export default function ReportForm() {
  const [isOpen, setIsOpen] = useState(false);
  const initialFormData = {
    title: "",
    disaster_category: disasterTypesForForm[0].value,
    location: "",
    description: "",
    author: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!formData.title || !formData.location || !formData.author || !formData.description) {
      setSubmitError("Harap isi semua field yang wajib diisi (*).");
      setIsSubmitting(false);
      return;
    }

    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    formPayload.append("disaster_category", formData.disaster_category);
    formPayload.append("location", formData.location);
    formPayload.append("description", formData.description);
    formPayload.append("author", formData.author);

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formPayload.append("documentation", files[i]);
      }
    }

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        body: formPayload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim laporan. Silakan coba lagi.");
      }

      setSubmitSuccess(result.message || "Laporan berhasil dikirim!");
      setFormData(initialFormData);
      setFiles(null);
      const fileInput = document.getElementById("documentation") as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }

      window.dispatchEvent(new CustomEvent("reportSubmitted"));

      setTimeout(() => {
        setIsOpen(false);
        setSubmitSuccess(null);
      }, 2500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsOpen(true);
            setSubmitError(null);
            setSubmitSuccess(null);
          }}
          className="bg-[#009E60] hover:bg-copper text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group"
        >
          <PlusCircle className="h-6 w-6" />
          <span className="hidden group-hover:block whitespace-nowrap">Laporkan Bencana</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-blue bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary dark:text-blue-400 flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Laporkan Bencana
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
              aria-label="Tutup"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bantu komunitas dengan melaporkan kondisi bencana di sekitar Anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm">
              {submitSuccess}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Laporan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Contoh: Banjir di Perumahan Griya Indah"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-700"
            />
          </div>

          {/* Disaster Category */}
          <div>
            <label
              htmlFor="disaster_category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Kategori Bencana <span className="text-red-500">*</span>
            </label>
            <select
              id="disaster_category"
              name="disaster_category"
              value={formData.disaster_category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-700 appearance-none"
            >
              {disasterTypesForForm.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lokasi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="Contoh: Bekasi, Jawa Barat"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Pelapor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
              placeholder="Nama Anda"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-700"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deskripsi Dampak Kerusakan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              placeholder="Jelaskan kondisi bencana, dampak kerusakan, dan bantuan yang diperlukan..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none bg-white dark:bg-gray-700"
            />
          </div>

          {/* Documentation */}
          <div>
            <label htmlFor="documentation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dokumentasi (Foto/Video)
            </label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="file"
                id="documentation"
                name="documentation"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setFiles(e.target.files)}
                className="w-full pl-10 pr-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-primary dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Upload foto atau video untuk mendukung laporan Anda (opsional).
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#009E60] px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#0F4D0F] transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Kirim Laporan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
