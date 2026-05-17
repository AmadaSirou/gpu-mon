# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

`nvidia-smi` をポーリングしてGPUのVRAM使用量と使用率をターミナル上にリアルタイムのラインチャートで表示する、Node.js製のモニタリングツール。

## コマンド

```bash
# 依存パッケージのインストール
npm install

# モニター起動
node monitor.js
```

終了は `q`、`Escape`、または `Ctrl+C`。

## アーキテクチャ

エントリーポイントは `monitor.js` のみ（単一ファイル構成）。

- **UIレイヤー**: `blessed` + `blessed-contrib` によるターミナルUI。2行1列の `grid` に2本のラインチャート（VRAMとGPU使用率）を配置。
- **データ取得**: `execSync` で `nvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv,noheader,nounits` を1秒ごとに呼び出す。
- **リングバッファ**: 直近60サンプルを固定長配列 (`MEM_MAX = 60`) でスライドさせて保持し、チャートデータとして渡す。

## 前提条件

- `nvidia-smi` が PATH に存在すること（NVIDIAドライバのインストールが必要）
- WSL2環境の場合、ホスト側のGPUドライバが対応している必要がある
