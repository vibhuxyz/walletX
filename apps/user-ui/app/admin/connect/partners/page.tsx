"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  Clipboard,
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CONNECT_SCOPES,
  createConnectPartner,
  listConnectPartners,
  type ConnectScope,
  type CreatedPartnerApp,
} from "@/lib/api/connectApi";

const SERVICE_KEY_STORAGE = "walletxConnectServiceKey";

const SCOPE_LABELS: Record<ConnectScope, string> = {
  "wallet:read": "Read balances",
  "wallet:hold": "Create and release holds",
  "wallet:capture": "Capture holds",
  "wallet:credit": "Credit settlements",
};

export default function ConnectPartnersPage() {
  const queryClient = useQueryClient();
  const [serviceKey, setServiceKey] = useState(() =>
    typeof window === "undefined"
      ? ""
      : sessionStorage.getItem(SERVICE_KEY_STORAGE) || "",
  );
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [scopes, setScopes] = useState<ConnectScope[]>([
    "wallet:read",
    "wallet:hold",
    "wallet:capture",
    "wallet:credit",
  ]);
  const [createdPartner, setCreatedPartner] =
    useState<CreatedPartnerApp | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const serviceKeyReady = serviceKey.trim().length > 0;

  const partnersQuery = useQuery({
    queryKey: ["connect-partners"],
    queryFn: () => listConnectPartners(serviceKey.trim()),
    enabled: isUnlocked,
    retry: false,
  });

  const verifyServiceKeyMutation = useMutation({
    mutationFn: () => listConnectPartners(serviceKey.trim()),
    onSuccess: (partners) => {
      sessionStorage.setItem(SERVICE_KEY_STORAGE, serviceKey.trim());
      queryClient.setQueryData(["connect-partners"], partners);
      setIsUnlocked(true);
      toast.success("Admin access verified");
    },
    onError: (error: any) => {
      setIsUnlocked(false);
      sessionStorage.removeItem(SERVICE_KEY_STORAGE);
      toast.error(
        error.response?.data?.error?.message ??
          "Invalid WalletX service key",
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createConnectPartner(
        {
          name: name.trim(),
          redirectUris: [redirectUri.trim()],
          scopes,
        },
        serviceKey.trim(),
      ),
    onSuccess: (partner) => {
      setCreatedPartner(partner);
      setName("");
      setRedirectUri("");
      queryClient.invalidateQueries({ queryKey: ["connect-partners"] });
      toast.success("Partner app created");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message ??
          error.response?.data?.message ??
          "Unable to create partner",
      );
    },
  });

  const sortedPartners = useMemo(
    () => partnersQuery.data ?? [],
    [partnersQuery.data],
  );

  function verifyServiceKey() {
    verifyServiceKeyMutation.mutate();
  }

  async function copyValue(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  }

  function toggleScope(scope: ConnectScope, checked: boolean) {
    setScopes((current) =>
      checked
        ? Array.from(new Set([...current, scope]))
        : current.filter((item) => item !== scope),
    );
  }

  const canCreate =
    isUnlocked &&
    name.trim().length >= 2 &&
    redirectUri.trim().length > 0 &&
    scopes.length > 0 &&
    !createMutation.isPending;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-[#25d366]" />
          <h1 className="text-2xl font-bold text-foreground">
            Connect Partners
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Create WalletX Connect credentials for apps that need hosted wallet
          onboarding and trading wallet APIs.
        </p>
      </div>

      {!isUnlocked && (
        <Card className="mx-auto w-full max-w-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Admin Access Required</CardTitle>
            <CardDescription>
              Enter the WalletX service key before creating or viewing partner
              credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input
              type="password"
              value={serviceKey}
              onChange={(event) => setServiceKey(event.target.value)}
              placeholder="X-WalletX-Service-Key"
              onKeyDown={(event) => {
                if (event.key === "Enter" && serviceKeyReady) {
                  verifyServiceKey();
                }
              }}
            />
            <Button
              onClick={verifyServiceKey}
              disabled={!serviceKeyReady || verifyServiceKeyMutation.isPending}
            >
              {verifyServiceKeyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock partner management"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {isUnlocked && (
        <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Owner Access</CardTitle>
          <CardDescription>
            Admin access is verified for this browser session.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <Input
            type="password"
            value={serviceKey}
            onChange={(event) => setServiceKey(event.target.value)}
            placeholder="X-WalletX-Service-Key"
          />
          <Button
            onClick={verifyServiceKey}
            disabled={!serviceKeyReady || verifyServiceKeyMutation.isPending}
          >
            Re-verify
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              sessionStorage.removeItem(SERVICE_KEY_STORAGE);
              setIsUnlocked(false);
              queryClient.removeQueries({ queryKey: ["connect-partners"] });
            }}
          >
            Lock
          </Button>
        </CardContent>
      </Card>
      )}

      {isUnlocked && createdPartner && (
        <Card className="border-success/30 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-success" />
              Copy Credentials Once
            </CardTitle>
            <CardDescription>
              The API secret is shown only now. Store it in the partner app
              backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <CredentialRow
              label="Base URL"
              value={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}
              copiedField={copiedField}
              onCopy={copyValue}
            />
            <CredentialRow
              label="Partner key"
              value={createdPartner.apiKey}
              copiedField={copiedField}
              onCopy={copyValue}
            />
            <CredentialRow
              label="Partner secret"
              value={createdPartner.apiSecret}
              copiedField={copiedField}
              onCopy={copyValue}
            />
            <CredentialRow
              label="Redirect URI"
              value={createdPartner.redirectUris[0] ?? ""}
              copiedField={copiedField}
              onCopy={copyValue}
            />
          </CardContent>
        </Card>
      )}

      {isUnlocked && (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Create Partner App
            </CardTitle>
            <CardDescription>
              Register a market app and generate its WalletX Connect API
              credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="partner-name">Partner name</Label>
              <Input
                id="partner-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Kalshi Clone"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="redirect-uri">Redirect URI</Label>
              <Input
                id="redirect-uri"
                value={redirectUri}
                onChange={(event) => setRedirectUri(event.target.value)}
                placeholder="https://kalshi-clone.com/wallet/callback"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Scopes</Label>
              <div className="grid gap-3">
                {CONNECT_SCOPES.map((scope) => (
                  <label
                    key={scope}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={scopes.includes(scope)}
                      onCheckedChange={(checked) =>
                        toggleScope(scope, checked === true)
                      }
                    />
                    <span>
                      <span className="font-medium">{SCOPE_LABELS[scope]}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {scope}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={() => createMutation.mutate()}
              disabled={!canCreate}
              className="mt-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate API key and secret"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Existing Partners</CardTitle>
                <CardDescription>
                  View registered apps and their public API keys.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!serviceKeyReady || partnersQuery.isFetching}
                onClick={() => partnersQuery.refetch()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {partnersQuery.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading partners...
              </div>
            )}

            {partnersQuery.isError && (
              <p className="text-sm text-destructive">
                Could not load partners. Check the service key.
              </p>
            )}

            {!partnersQuery.isLoading &&
              !partnersQuery.isError &&
              sortedPartners.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No partner apps yet.
                </p>
              )}

            <div className="flex flex-col gap-4">
              {sortedPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="rounded-lg border border-border/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{partner.name}</p>
                        <Badge
                          variant={
                            partner.status === "ACTIVE"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {partner.status}
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {partner.apiKey}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyValue(`${partner.id}:apiKey`, partner.apiKey)
                      }
                    >
                      {copiedField === `${partner.id}:apiKey` ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Clipboard className="mr-2 h-4 w-4" />
                      )}
                      Copy key
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid gap-3 text-sm md:grid-cols-3">
                    <Info label="Linked wallets" value={partner.counts.walletLinks} />
                    <Info
                      label="Onboarding sessions"
                      value={partner.counts.onboardingSessions}
                    />
                    <Info label="Holds" value={partner.counts.holds} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {partner.scopes.map((scope) => (
                      <Badge key={scope} variant="outline">
                        {scope}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Redirect URIs
                    </p>
                    {partner.redirectUris.map((uri) => (
                      <p key={uri} className="break-all font-mono text-xs">
                        {uri}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}

function CredentialRow({
  label,
  value,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  copiedField: string | null;
  onCopy: (label: string, value: string) => void;
}) {
  return (
    <div className="grid gap-2 rounded-lg border border-success/20 bg-white/70 p-3 md:grid-cols-[130px_1fr_auto] md:items-center">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <code className="break-all rounded bg-muted px-2 py-1 text-xs">
        {value}
      </code>
      <Button variant="outline" size="sm" onClick={() => onCopy(label, value)}>
        {copiedField === label ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <Clipboard className="mr-2 h-4 w-4" />
        )}
        Copy
      </Button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
