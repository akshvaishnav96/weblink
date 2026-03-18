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

function ExpertAvatar({ picture, initials }: { picture?: string; initials: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (picture && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={picture}
        alt={initials}
        className={styles.avatarImg}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className={styles.placeholder}>
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
        <div className={styles.placeholder}>
          <User size={22} strokeWidth={1.5} />
        </div>
        <p className={styles.name}>Anyone</p>
      </button>

      {/* Named experts */}
      {experts.map((expert) => (
        <button
          key={expert.id}
          onClick={() => onSelect(expert.id)}
          className={`${styles.card}${selectedId === expert.id ? ` ${styles.active}` : ""}`}
        >
          <ExpertAvatar picture={expert.picture} initials={expert.initials} />
          <p className={styles.name}>{expert.name}</p>
        </button>
      ))}
    </div>
  );
}
