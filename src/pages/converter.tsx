"use client";

import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import Select from "@/components/Select";
import Toggle from "@/components/Toggle";

export default function Converter() {
  return (
    <AppShell>
      <PageHeader
        title="File Converter"
        subtitle="Document, image, video, and audio conversions with premium tools."
      />

      {/* DOCUMENT TOOLS */}
      <SectionCard
        title="Document Tools"
        description="PDF, Word, PPT, Excel, Text, Images."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Select>
            <option>PDF ↔ Word / PPT / Excel</option>
            <option>PDF → Text / Images</option>
            <option>Image → PDF</option>
            <option>TXT → PDF</option>
          </Select>
          <Button>Convert</Button>

          <Select>
            <option>Merge PDF</option>
            <option>Split PDF</option>
            <option>Compress PDF</option>
            <option>Extract ZIP / RAR</option>
          </Select>
          <Button variant="secondary">Apply Tool</Button>
        </div>
      </SectionCard>

      {/* IMAGE TOOLS */}
      <SectionCard
        title="Image Tools"
        description="JPG, PNG, WEBP, HEIC conversions."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Select>
            <option>JPG ↔ PNG</option>
            <option>WEBP → JPG</option>
            <option>HEIC → JPG</option>
          </Select>
          <Button>Convert Image</Button>
        </div>
      </SectionCard>

      {/* VIDEO + AUDIO TOOLS */}
      <SectionCard
        title="Video & Audio"
        description="MP4, MOV, MKV, AVI, MP3, WAV, AAC, M4A."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Select>
            <option>MP4 ↔ MP3</option>
            <option>MP4 ↔ MOV</option>
            <option>MKV → MP4</option>
            <option>AVI → MP4</option>
            <option>Video → GIF</option>
          </Select>
          <Button>Convert Video</Button>

          <Select>
            <option>MP3 ↔ WAV</option>
            <option>AAC → MP3</option>
            <option>M4A → MP3</option>
          </Select>
          <Button variant="secondary">Convert Audio</Button>
        </div>
      </SectionCard>

      {/* PREMIUM TOOLS */}
      <SectionCard
        title="Premium Tools"
        description="OCR, scanned PDF to Word, large files."
      >
        <div className="flex flex-wrap gap-3">
          <Toggle checked={false} onChange={() => {}} label="OCR (Premium)" />
          <Toggle checked={false} onChange={() => {}} label="Scanned PDF → Word" />
          <Toggle checked={false} onChange={() => {}} label="Large Files" />
          <span className="chip">Ads for Freemium Only</span>
        </div>
      </SectionCard>
    </AppShell>
  );
}