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
        width={60}
        height={60}
        className="w-[60px] h-[60px] rounded-full object-cover mx-auto mb-2 block"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="w-[60px] h-[60px] rounded-full bg-[#e0e0e0] text-[#777] text-[22px] mx-auto mb-2 flex items-center justify-center">
      {initials}
    </div>
  );
}

export default function ExpertSelector({ experts, selectedId, onSelect }: ExpertSelectorProps) {
  return (
    <div className={styles.selector}>
      {/* Anyone */}
      <button
        onClick={() => onSelect("anyone")}
        className={`${styles.card}${selectedId === "anyone" ? ` ${styles.active}` : ""}`}
      >
        <div className="w-[60px] h-[60px] rounded-full bg-[#e0e0e0] text-[#777] text-[22px] mx-auto mb-2 flex items-center justify-center">
          <User size={22} strokeWidth={1.5} />
        </div>
        <p className="text-[14px] text-[#333] m-0">Anyone</p>
      </button>

      {/* Named experts */}
      {experts.map((expert) => (
        <button
          key={expert.id}
          onClick={() => onSelect(expert.id)}
          className={`${styles.card}${selectedId === expert.id ? ` ${styles.active}` : ""}`}
        >
          <ExpertAvatar picture={expert.picture} initials={expert.initials} />
          <p className="text-[14px] text-[#333] m-0">{expert.name}</p>
        </button>
      ))}
    </div>
  );
}
