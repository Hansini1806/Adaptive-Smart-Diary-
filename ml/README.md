# BiLSTM emotion model

This folder contains a real PyTorch BiLSTM classifier trained on the public
`dair-ai/emotion` dataset. The dataset labels are `sadness`, `joy`, `love`,
`anger`, `fear`, and `surprise`. Predictions and evaluation metrics come from
the saved model weights; there is no fallback or hardcoded production result.

## Windows PowerShell setup

Use Python 3.11 or 3.12. PyTorch wheels for newer Python versions may not be
available for every release.

From `C:\Users\hansi\Adaptive-Smart-Diary-\ai-smart-diary`:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements-dev.txt
```

If PowerShell prevents environment activation, either allow it for the current
terminal with `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`, or
run the venv interpreter directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
```

## Download data, train, and evaluate

The first training command downloads `dair-ai/emotion` from Hugging Face through
the `datasets` package and caches it in the current user's Hugging Face cache.
An internet connection is required. No diary data is uploaded or used for
training.

```powershell
python -m ml.train
python -m ml.evaluate
python -m ml.predict "I had a wonderful day with my friends."
```

Training saves `model.pt`, `vocab.json`, and `model_config.json` in
`ml\artifacts`. Evaluation runs on the dataset's held-out **test** split and
prints actual accuracy, macro precision, macro recall, macro F1, and a
confusion matrix. It also writes the measured values to
`ml\artifacts\evaluation.json`. Do not report metrics until evaluation has
completed successfully.

CPU training can take several minutes. A CUDA-enabled PyTorch install and
compatible NVIDIA drivers can be used to train on a supported GPU. For a quick
pipeline smoke test only, train fewer epochs with
`python -m ml.train --epochs 1`; evaluate the resulting checkpoint normally.
That metric is real for that one-epoch checkpoint but should not be treated as
a final model score.

## Start the authenticated API

Copy `backend\.env.example` to `backend\.env`, then set the Supabase project URL
and **publishable** key. These must match the Supabase project configured in the
Vite app. Never put a Supabase service-role key in the frontend or this
inference service.

After training has produced `ml\artifacts`:

```powershell
python -m uvicorn app.main:app --app-dir backend --reload
```

The API listens on `http://127.0.0.1:8000`; OpenAPI docs are at
`http://127.0.0.1:8000/docs`. `GET /health` checks that the API process is
running. `POST /api/emotions/analyze` requires a Supabase access token:

```powershell
$token = "paste-a-current-user-access-token-here"
$headers = @{ Authorization = "Bearer $token" }
$body = @{ text = "I had a wonderful day with my friends." } | ConvertTo-Json
Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8000/api/emotions/analyze `
  -Headers $headers -ContentType "application/json" -Body $body
```

The response contains the predicted emotion, confidence, probabilities for all
six classes, and model version. To also persist an analysis, include
`diary_entry_id` in the request body. The backend verifies the access token with
Supabase Auth and writes the result using the user's own bearer token, so the
existing `emotion_analyses` RLS policy applies. The referenced entry must
belong to that same user. The diary text itself is not sent to Supabase.

## Tests

From the project root, while the virtual environment is active:

```powershell
python -m pytest backend\tests -v
```

API tests use explicit test-only doubles for authentication/model dependencies;
they do not produce or claim model accuracy. Run `python -m ml.evaluate` for
the actual trained model's held-out test results.

## Training notes

The training tokenizer and vocabulary are created from the training split only.
The best checkpoint is selected using validation accuracy; the test split is
reserved for evaluation. Training is reproducible with seed 42 by default.
Dataset and training hyperparameters are saved with the artifacts. The
classifier identifies text patterns, not mental-health conditions, and can be
wrong or biased.
