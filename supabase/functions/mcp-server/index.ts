import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Supabase admin client ───────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

// ─── MCP Tool definitions ───────────────────────────────────────────────────
const TOOLS = [
  {
    name: "list_users",
    description: "Lista todos os usuários (profiles) com nome e data de criação. Pode filtrar por nome.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Filtro opcional por nome (ILIKE)" },
        limit: { type: "number", description: "Máximo de resultados (default 50)" },
      },
    },
  },
  {
    name: "get_user_details",
    description: "Retorna detalhes completos de um usuário: perfil, roles, assinatura, contagem de eventos/despesas/locais/metas.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "UUID do usuário" },
      },
      required: ["user_id"],
    },
  },
  {
    name: "list_events",
    description: "Lista eventos (plantões/consultas) de um usuário com filtros opcionais.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "UUID do usuário" },
        status: { type: "string", description: "Filtro por status: scheduled, completed, cancelled" },
        payment_status: { type: "string", description: "Filtro: pending, paid, overdue" },
        date_from: { type: "string", description: "Data início (YYYY-MM-DD)" },
        date_to: { type: "string", description: "Data fim (YYYY-MM-DD)" },
        limit: { type: "number", description: "Máximo de resultados (default 50)" },
      },
      required: ["user_id"],
    },
  },
  {
    name: "list_expenses",
    description: "Lista despesas de um usuário com filtros opcionais.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "UUID do usuário" },
        category: { type: "string", description: "Filtro por categoria" },
        date_from: { type: "string", description: "Data início (YYYY-MM-DD)" },
        date_to: { type: "string", description: "Data fim (YYYY-MM-DD)" },
        limit: { type: "number", description: "Máximo de resultados (default 50)" },
      },
      required: ["user_id"],
    },
  },
  {
    name: "list_locations",
    description: "Lista locais (hospitais/clínicas) de um usuário.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "UUID do usuário" },
      },
      required: ["user_id"],
    },
  },
  {
    name: "list_goals",
    description: "Lista metas financeiras de um usuário.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "UUID do usuário" },
        year: { type: "number", description: "Filtro por ano" },
      },
      required: ["user_id"],
    },
  },
  {
    name: "list_subscriptions",
    description: "Lista todas as assinaturas ativas ou retorna a assinatura de um usuário específico.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "UUID do usuário (opcional, se vazio lista todas)" },
        status: { type: "string", description: "Filtro por status: active, past_due, canceled, incomplete" },
      },
    },
  },
  {
    name: "get_stats",
    description: "Retorna estatísticas gerais do sistema: total de usuários, eventos, despesas, assinaturas ativas por plano.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "run_query",
    description: "Consulta uma tabela específica com filtros. Tabelas permitidas: profiles, events, expenses, locations, goals, subscriptions, user_roles, entitlements.",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string", description: "Nome da tabela" },
        filters: {
          type: "object",
          description: "Pares chave-valor para filtrar (eq match)",
          additionalProperties: { type: "string" },
        },
        select: { type: "string", description: "Colunas a selecionar (default: *)" },
        limit: { type: "number", description: "Máximo de resultados (default 50)" },
        order_by: { type: "string", description: "Coluna para ordenar" },
        ascending: { type: "boolean", description: "Ordem ascendente (default false)" },
      },
      required: ["table"],
    },
  },
];

const ALLOWED_TABLES = [
  "profiles", "events", "expenses", "locations", "goals",
  "subscriptions", "user_roles", "entitlements", "user_nav_prefs", "user_shortcuts",
];

// ─── Tool handlers ──────────────────────────────────────────────────────────
async function handleTool(name: string, args: Record<string, any>) {
  const sb = getSupabase();

  switch (name) {
    case "list_users": {
      let q = sb.from("profiles").select("*").limit(args.limit ?? 50).order("created_at", { ascending: false });
      if (args.search) q = q.ilike("name", `%${args.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }

    case "get_user_details": {
      const uid = args.user_id;
      const [profile, roles, subscription, eventsCount, expensesCount, locationsCount, goalsCount] =
        await Promise.all([
          sb.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
          sb.from("user_roles").select("role").eq("user_id", uid),
          sb.from("subscriptions").select("*").eq("user_id", uid).maybeSingle(),
          sb.from("events").select("id", { count: "exact", head: true }).eq("user_id", uid),
          sb.from("expenses").select("id", { count: "exact", head: true }).eq("user_id", uid),
          sb.from("locations").select("id", { count: "exact", head: true }).eq("user_id", uid),
          sb.from("goals").select("id", { count: "exact", head: true }).eq("user_id", uid),
        ]);
      return {
        profile: profile.data,
        roles: roles.data?.map((r: any) => r.role) ?? [],
        subscription: subscription.data,
        counts: {
          events: eventsCount.count ?? 0,
          expenses: expensesCount.count ?? 0,
          locations: locationsCount.count ?? 0,
          goals: goalsCount.count ?? 0,
        },
      };
    }

    case "list_events": {
      let q = sb.from("events").select("*").eq("user_id", args.user_id)
        .limit(args.limit ?? 50).order("date", { ascending: false });
      if (args.status) q = q.eq("status", args.status);
      if (args.payment_status) q = q.eq("payment_status", args.payment_status);
      if (args.date_from) q = q.gte("date", args.date_from);
      if (args.date_to) q = q.lte("date", args.date_to);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }

    case "list_expenses": {
      let q = sb.from("expenses").select("*").eq("user_id", args.user_id)
        .limit(args.limit ?? 50).order("date", { ascending: false });
      if (args.category) q = q.eq("category", args.category);
      if (args.date_from) q = q.gte("date", args.date_from);
      if (args.date_to) q = q.lte("date", args.date_to);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }

    case "list_locations": {
      const { data, error } = await sb.from("locations").select("*").eq("user_id", args.user_id);
      if (error) throw error;
      return data;
    }

    case "list_goals": {
      let q = sb.from("goals").select("*").eq("user_id", args.user_id).order("year", { ascending: false }).order("month", { ascending: false });
      if (args.year) q = q.eq("year", args.year);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }

    case "list_subscriptions": {
      let q = sb.from("subscriptions").select("*").limit(100).order("created_at", { ascending: false });
      if (args.user_id) q = q.eq("user_id", args.user_id);
      if (args.status) q = q.eq("status", args.status);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }

    case "get_stats": {
      const [users, events, expenses, activeSubs] = await Promise.all([
        sb.from("profiles").select("id", { count: "exact", head: true }),
        sb.from("events").select("id", { count: "exact", head: true }),
        sb.from("expenses").select("id", { count: "exact", head: true }),
        sb.from("subscriptions").select("plan").eq("status", "active"),
      ]);

      const planCounts: Record<string, number> = {};
      (activeSubs.data ?? []).forEach((s: any) => {
        planCounts[s.plan] = (planCounts[s.plan] ?? 0) + 1;
      });

      return {
        total_users: users.count ?? 0,
        total_events: events.count ?? 0,
        total_expenses: expenses.count ?? 0,
        active_subscriptions: activeSubs.data?.length ?? 0,
        subscriptions_by_plan: planCounts,
      };
    }

    case "run_query": {
      if (!ALLOWED_TABLES.includes(args.table)) {
        throw new Error(`Tabela "${args.table}" não permitida. Permitidas: ${ALLOWED_TABLES.join(", ")}`);
      }
      let q = sb.from(args.table).select(args.select ?? "*").limit(args.limit ?? 50);
      if (args.filters) {
        for (const [key, value] of Object.entries(args.filters)) {
          q = q.eq(key, value as string);
        }
      }
      if (args.order_by) q = q.order(args.order_by, { ascending: args.ascending ?? false });
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }

    default:
      throw new Error(`Tool "${name}" not found`);
  }
}

// ─── MCP JSON-RPC handler ───────────────────────────────────────────────────
async function handleJsonRpc(body: any) {
  const { id, method, params } = body;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "plantaomed-mcp", version: "1.0.0" },
        },
      };

    case "notifications/initialized":
      return null; // no response needed

    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: { tools: TOOLS },
      };

    case "tools/call": {
      const toolName = params?.name;
      const toolArgs = params?.arguments ?? {};
      try {
        const result = await handleTool(toolName, toolArgs);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          },
        };
      } catch (err: any) {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: `Erro: ${err.message}` }],
            isError: true,
          },
        };
      }
    }

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

// ─── HTTP server (Streamable HTTP transport) ─────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check: require a secret token
  const MCP_SECRET = Deno.env.get("MCP_SERVER_SECRET");
  if (MCP_SECRET) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${MCP_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const body = await req.json();

    // Handle batch requests
    if (Array.isArray(body)) {
      const results = await Promise.all(body.map(handleJsonRpc));
      const filtered = results.filter(Boolean);
      return new Response(JSON.stringify(filtered), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await handleJsonRpc(body);
    if (!result) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("MCP Server error:", err);
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
