"use client";

import React, { useState } from "react";

export default function BusinessSetupPage() {
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    businessType: "",
    website: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    alert("Pendaftaran bisnis berhasil!");
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-primary">
          Daftar Bisnis Anda
        </h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700 dark:text-white/60">
            Nama Bisnis
          </label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
            placeholder="Contoh: Toko Sukses"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700 dark:text-white/60">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
            placeholder="Email bisnis"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700 dark:text-white/60">
            Nomor Telepon
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
            placeholder="08xxxxxxxxxx"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700 dark:text-white/60">
            Alamat Bisnis
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
            placeholder="Alamat lengkap"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700 dark:text-white/60">
            Jenis Bisnis
          </label>
          <select
            name="businessType"
            value={form.businessType}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Pilih jenis bisnis</option>
            <option value="retail">Retail</option>
            <option value="food">Makanan & Minuman</option>
            <option value="service">Jasa</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-700 dark:text-white/60">
            Website (Opsional)
          </label>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            placeholder="https://"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary/90"
        >
          Daftar Bisnis
        </button>
      </form>
    </div>
  );
}
