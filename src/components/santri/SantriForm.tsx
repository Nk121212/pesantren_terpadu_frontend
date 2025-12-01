// src/components/santri/SantriForm.tsx
"use client";
import React, { useState } from "react";
import { Santri } from "@/lib/api";

type Props = {
  initialData?: Santri;
  onSubmit: (payload: Partial<Santri>) => Promise<void>;
  onCancel: () => void;
};

export default function SantriForm({ initialData, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [gender, setGender] = useState(initialData?.gender ?? "Pria");
  const [birthDate, setBirthDate] = useState(initialData?.birthDate ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        gender,
        birthDate,
        address,
        guardianId: initialData?.guardianId,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div>
        <label className="block text-sm">Nama</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option>Pria</option>
          <option>Wanita</option>
        </select>
      </div>

      <div>
        <label className="block text-sm">Tanggal Lahir</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm">Alamat</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
