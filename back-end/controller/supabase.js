/**
 * IMPORT das bibliotecas que serão usadas
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Cria a conexão com o banco de dados usando as váriveis que estão dentro do .ENV
 */
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)