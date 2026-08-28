import React, { useState } from 'react';
import { DAFData } from '@/lib/aiBank';

interface DAFFormProps {
  onComplete: (data: DAFData) => void;
}

export default function DAFForm({ onComplete }: DAFFormProps) {
  const [data, setData] = useState<DAFData>({
    homeState: '',
    graduationSubject: '',
    hobbies: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-soft">
      <h2 className="text-lg font-semibold text-ink-900">Personalize your Interview</h2>
      <input
        required
        placeholder="Home State"
        className="w-full p-2 border border-ink-200 rounded-lg"
        value={data.homeState}
        onChange={(e) => setData({ ...data, homeState: e.target.value })}
      />
      <input
        required
        placeholder="Graduation Subject"
        className="w-full p-2 border border-ink-200 rounded-lg"
        value={data.graduationSubject}
        onChange={(e) => setData({ ...data, graduationSubject: e.target.value })}
      />
      <input
        required
        placeholder="Hobbies"
        className="w-full p-2 border border-ink-200 rounded-lg"
        value={data.hobbies}
        onChange={(e) => setData({ ...data, hobbies: e.target.value })}
      />
      <button
        type="submit"
        className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold"
      >
        Start Interview
      </button>
    </form>
  );
}
