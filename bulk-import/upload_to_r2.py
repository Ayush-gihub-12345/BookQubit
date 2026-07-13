#!/usr/bin/env python3
"""
Uploads the chunk files produced by prepare_import.py to a Cloudflare R2
bucket, ready for the cron worker to consume. R2 is S3-compatible, so this
just uses boto3 pointed at your account's R2 endpoint.

Requires: pip install boto3

Set these before running (from Cloudflare dashboard -> R2 -> Manage API tokens):
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET

Usage:
  python upload_to_r2.py --chunks-dir ./chunks --prefix import-queue
"""

import argparse
import os
import sys
from pathlib import Path

import boto3


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chunks-dir", required=True)
    ap.add_argument("--prefix", default="import-queue")
    args = ap.parse_args()

    account_id = os.environ["R2_ACCOUNT_ID"]
    bucket = os.environ["R2_BUCKET"]
    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        region_name="auto",
    )

    files = sorted(Path(args.chunks_dir).glob("chunk-*.jsonl"))
    if not files:
        print("No chunk-*.jsonl files found — run prepare_import.py first.", file=sys.stderr)
        sys.exit(1)

    for i, path in enumerate(files, 1):
        key = f"{args.prefix}/{path.name}"
        s3.upload_file(str(path), bucket, key)
        print(f"[{i}/{len(files)}] uploaded {key}", file=sys.stderr)

    # A small marker object telling the cron worker how many chunks exist in
    # total, so it knows when it's reached the end of the queue.
    s3.put_object(Bucket=bucket, Key=f"{args.prefix}/manifest.json", Body=f'{{"totalChunks": {len(files)}}}'.encode())
    print(f"\nUploaded {len(files)} chunks under {args.prefix}/ — manifest.json written.", file=sys.stderr)


if __name__ == "__main__":
    main()
