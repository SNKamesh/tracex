"use client";

import React from "react";

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Select(props: SelectProps) {
  return <select {...props} />;
}