"use client";

import { useState } from "react";
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

function ExpertAvatar({ picture, initials, active }: { picture?: string; initials: string; active: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (picture && !imgFailed) {
    return (
      <div className={`${styles.avatar} ${active ? styles.avatarActive : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={picture}
          alt={initials}
          className={`${styles.avatarImg}${active ? ` ${styles.avatarImgActive}` : ""}`}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.avatar}${active ? ` ${styles.avatarActive}` : ""}`}>
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
        className={`${styles.item}${selectedId === "anyone" ? ` ${styles.itemActive}` : ""}`}
      >
        <div className={`${styles.avatar}${selectedId === "anyone" ? ` ${styles.avatarActive}` : ""}`}>
          <User className={styles.personIcon} />
        </div>
        <span className={styles.label}>Anyone</span>
      </button>

      {/* Named experts */}
      {experts.map((expert) => (
        <button
          key={expert.id}
          onClick={() => onSelect(expert.id)}
          className={`${styles.item} ${styles.itemNamed}${selectedId === expert.id ? ` ${styles.itemActive}` : ""}`}
        >
          <ExpertAvatar
            picture={expert.picture}
            initials={expert.initials}
            active={selectedId === expert.id}
          />
          <span className={styles.label}>{expert.name}</span>
        </button>
      ))}
    </div>
  );
}
