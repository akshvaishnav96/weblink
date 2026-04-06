"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import styles from "./ExpertSelector.module.css";

interface Expert {
  id: string;
  initials: string;
  name: string;
  picture?: string;
}

interface ExpertSelectorProps {
  experts: Expert[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function ExpertAvatar({ picture, initials }: { picture?: string; initials: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (picture && !imgFailed) {
    return (
      <Image
        src={picture}
        alt={initials}
        width={54}
        height={54}
        className="w-[54px] h-[54px] rounded-full object-cover flex-shrink-0"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="w-[54px] h-[54px] rounded-full bg-[#e0e0e0] text-[#777] text-[18px] flex items-center justify-center flex-shrink-0">
      {initials}
    </div>
  );
}

function abbreviateName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const first = parts[0];
  const rest = parts.slice(1).map((p) => p[0].toUpperCase() + ".").join(" ");
  return `${first} ${rest}`;
}

export default function ExpertSelector({ experts, selectedId, onSelect }: ExpertSelectorProps) {
  return (
    <div className={styles.selector}>
      {/* Anyone — only shown when there are multiple staff to choose from */}
      {experts.length > 1 && (
        <button
          onClick={() => onSelect("anyone")}
          className={`${styles.card}${selectedId === "anyone" ? ` ${styles.active}` : ""}`}
        >
          <div className="w-[54px] h-[54px] rounded-full bg-[#e0e0e0] text-[#777] flex items-center justify-center flex-shrink-0">
            <User size={20} strokeWidth={1.5} />
          </div>
          <p className="text-[13px] text-[#333] m-0 whitespace-nowrap">Anyone</p>
        </button>
      )}

      {/* Named experts */}
      {experts.map((expert) => (
        <button
          key={expert.id}
          onClick={() => onSelect(expert.id)}
          title={expert.name}
          className={`${styles.card}${selectedId === expert.id ? ` ${styles.active}` : ""}`}
        >
          <ExpertAvatar picture={expert.picture} initials={expert.initials} />
          <p className="text-[13px] text-[#333] m-0 w-full overflow-hidden text-ellipsis whitespace-nowrap leading-tight">
            {abbreviateName(expert.name)}
          </p>
        </button>
      ))}
    </div>
  );
}
