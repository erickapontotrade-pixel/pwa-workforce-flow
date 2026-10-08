ALTER TABLE public.companies ADD COLUMN legal_name text, ADD COLUMN trade_name text, ADD COLUMN contact_name text, ADD COLUMN phone text, ADD COLUMN email text, ADD COLUMN address text, ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE public.stores ADD COLUMN region text, ADD COLUMN contact_name text, ADD COLUMN phone text, ADD COLUMN hours text, ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE public.jobs ADD COLUMN store_id uuid REFERENCES public.stores(id);
CREATE TABLE public.talent_pool (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES public.companies(id), professional_id uuid NOT NULL REFERENCES public.professionals(id), created_by uuid NOT NULL DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(company_id, professional_id));
GRANT SELECT,INSERT,DELETE ON public.talent_pool TO authenticated;
GRANT ALL ON public.talent_pool TO service_role;
ALTER TABLE public.talent_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "talent company access" ON public.talent_pool FOR ALL TO authenticated USING (public.is_company_member(auth.uid(),company_id) OR public.is_staff(auth.uid())) WITH CHECK ((public.is_company_member(auth.uid(),company_id) OR public.is_staff(auth.uid())) AND EXISTS(SELECT 1 FROM public.professionals p WHERE p.id=professional_id AND p.talent_pool_consent));
CREATE OR REPLACE FUNCTION public.can_read_professional(_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.professionals p WHERE p.id=_id AND (p.user_id=auth.uid() OR public.is_staff(auth.uid()) OR (p.talent_pool_consent AND public.is_any_company_member(auth.uid())) OR EXISTS(SELECT 1 FROM public.applications a JOIN public.jobs j ON j.id=a.job_id WHERE a.professional_id=p.id AND public.is_company_member(auth.uid(),j.company_id)) OR EXISTS(SELECT 1 FROM public.freelance_applications a JOIN public.freelance_opportunities o ON o.id=a.opportunity_id WHERE a.professional_id=p.id AND public.is_company_member(auth.uid(),o.company_id)))) $$;
DO $$ DECLARE r record; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='companies' AND cmd='SELECT' LOOP EXECUTE format('DROP POLICY %I ON public.companies',r.policyname); END LOOP; END $$;
CREATE POLICY "companies scoped read" ON public.companies FOR SELECT TO authenticated USING(public.is_company_member(auth.uid(),id) OR public.is_staff(auth.uid()));
CREATE OR REPLACE FUNCTION public.company_display_name(_id uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT name FROM public.companies c WHERE c.id=_id AND (public.is_company_member(auth.uid(),c.id) OR public.is_staff(auth.uid()) OR EXISTS(SELECT 1 FROM public.jobs j WHERE j.company_id=c.id AND (j.status='publicada' OR EXISTS(SELECT 1 FROM public.applications a WHERE a.job_id=j.id AND a.professional_id=public.my_professional_id()))) OR EXISTS(SELECT 1 FROM public.freelance_opportunities o WHERE o.company_id=c.id AND (o.status IN ('publicada','interessados','selecionados') OR EXISTS(SELECT 1 FROM public.freelance_assignments a WHERE a.opportunity_id=o.id AND a.professional_id=public.my_professional_id())))) $$;
DO $$ DECLARE r record; t text; BEGIN FOREACH t IN ARRAY ARRAY['professionals','professional_experiences','professional_skills','availability'] LOOP FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t AND cmd='SELECT' LOOP EXECUTE format('DROP POLICY %I ON public.%I',r.policyname,t); END LOOP; END LOOP; END $$;
CREATE POLICY "professional scoped read" ON public.professionals FOR SELECT TO authenticated USING(public.can_read_professional(id));
CREATE POLICY "experience scoped read" ON public.professional_experiences FOR SELECT TO authenticated USING(public.can_read_professional(professional_id));
CREATE POLICY "skills scoped read" ON public.professional_skills FOR SELECT TO authenticated USING(public.can_read_professional(professional_id));
CREATE POLICY "availability scoped read" ON public.availability FOR SELECT TO authenticated USING(public.can_read_professional(professional_id));
CREATE POLICY "aponto candidate linking" ON public.applications FOR INSERT TO authenticated WITH CHECK((public.is_staff(auth.uid()) OR public.is_company_member(auth.uid(),public.job_company(job_id))) AND EXISTS(SELECT 1 FROM public.professionals p WHERE p.id=professional_id AND p.talent_pool_consent AND p.modality IN ('fixo','ambos')) AND stage='candidatura');
CREATE POLICY "aponto freelance linking" ON public.freelance_applications FOR INSERT TO authenticated WITH CHECK((public.is_staff(auth.uid()) OR public.is_company_member(auth.uid(),public.opportunity_company(opportunity_id))) AND EXISTS(SELECT 1 FROM public.professionals p WHERE p.id=professional_id AND p.talent_pool_consent AND p.modality IN ('freelancer','ambos')) AND status='interessado');
CREATE OR REPLACE FUNCTION public.validate_core_relationships() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF TG_TABLE_NAME IN ('jobs','freelance_opportunities') THEN
 IF NEW.store_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.stores s WHERE s.id=NEW.store_id AND s.company_id=NEW.company_id) THEN RAISE EXCEPTION 'Loja não pertence à empresa'; END IF;
 IF NEW.status::text='publicada' AND NOT EXISTS(SELECT 1 FROM public.companies c WHERE c.id=NEW.company_id AND c.active) THEN RAISE EXCEPTION 'Empresa inativa'; END IF;
ELSIF TG_TABLE_NAME='applications' THEN
 IF TG_OP='INSERT' AND NOT EXISTS(SELECT 1 FROM public.jobs j JOIN public.professionals p ON p.id=NEW.professional_id WHERE j.id=NEW.job_id AND j.status='publicada' AND p.modality IN ('fixo','ambos')) THEN RAISE EXCEPTION 'Vaga indisponível ou modalidade incompatível'; END IF;
 IF TG_OP='UPDATE' AND (NEW.job_id<>OLD.job_id OR NEW.professional_id<>OLD.professional_id) THEN RAISE EXCEPTION 'Vínculo da candidatura não pode ser alterado'; END IF;
ELSIF TG_TABLE_NAME='freelance_applications' THEN
 IF TG_OP='INSERT' AND NOT EXISTS(SELECT 1 FROM public.freelance_opportunities o JOIN public.professionals p ON p.id=NEW.professional_id WHERE o.id=NEW.opportunity_id AND o.status IN ('publicada','interessados','selecionados') AND o.starts_at>now() AND p.modality IN ('freelancer','ambos')) THEN RAISE EXCEPTION 'Oportunidade indisponível ou modalidade incompatível'; END IF;
 IF TG_OP='UPDATE' THEN
 IF NEW.professional_id<>OLD.professional_id OR NEW.opportunity_id<>OLD.opportunity_id THEN RAISE EXCEPTION 'Vínculo não pode ser alterado'; END IF;
 IF NOT (public.is_staff(auth.uid()) OR public.is_company_member(auth.uid(),public.opportunity_company(NEW.opportunity_id))) AND NEW.status NOT IN ('interessado','sem_interesse') THEN RAISE EXCEPTION 'Sem permissão para selecionar'; END IF;
 END IF;
END IF; RETURN NEW; END $$;
CREATE TRIGGER validate_job BEFORE INSERT OR UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.validate_core_relationships();
CREATE TRIGGER validate_opportunity BEFORE INSERT OR UPDATE ON public.freelance_opportunities FOR EACH ROW EXECUTE FUNCTION public.validate_core_relationships();
CREATE TRIGGER validate_application BEFORE INSERT OR UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.validate_core_relationships();
CREATE TRIGGER validate_freelance_application BEFORE INSERT OR UPDATE ON public.freelance_applications FOR EACH ROW EXECUTE FUNCTION public.validate_core_relationships();
CREATE OR REPLACE FUNCTION public.prevent_assignment_overlap() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
PERFORM 1 FROM public.professionals WHERE id=NEW.professional_id FOR UPDATE;
IF NEW.ends_at<=NEW.starts_at THEN RAISE EXCEPTION 'Período inválido'; END IF;
IF NEW.status IN ('cancelado','reprovado','convidado') THEN RETURN NEW; END IF;
IF EXISTS(SELECT 1 FROM public.freelance_assignments a WHERE a.professional_id=NEW.professional_id AND a.id<>NEW.id AND a.status NOT IN ('cancelado','reprovado','convidado') AND a.starts_at<NEW.ends_at AND NEW.starts_at<a.ends_at) THEN RAISE EXCEPTION 'Conflito de agenda: já existe uma reserva neste horário'; END IF;
IF EXISTS(SELECT 1 FROM public.availability v CROSS JOIN LATERAL generate_series((NEW.starts_at AT TIME ZONE 'America/Sao_Paulo')::date,(NEW.ends_at AT TIME ZONE 'America/Sao_Paulo')::date,interval '1 day') d WHERE v.professional_id=NEW.professional_id AND v.kind='fixo' AND v.weekday=extract(dow FROM d)::int AND ((d::date+v.start_time) AT TIME ZONE 'America/Sao_Paulo')<NEW.ends_at AND NEW.starts_at<((d::date+v.end_time) AT TIME ZONE 'America/Sao_Paulo')) THEN RAISE EXCEPTION 'Conflito com jornada fixa'; END IF;
RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.select_freelancer(_application_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE fa record; o record; aid uuid; BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
SELECT * INTO fa FROM public.freelance_applications WHERE id=_application_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Candidatura não encontrada'; END IF;
SELECT * INTO o FROM public.freelance_opportunities WHERE id=fa.opportunity_id FOR UPDATE;
IF NOT(public.is_company_member(auth.uid(),o.company_id) OR public.is_staff(auth.uid())) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
IF fa.status<>'interessado' OR o.status IN ('rascunho','cancelada','concluida') THEN RAISE EXCEPTION 'Seleção indisponível'; END IF;
IF (SELECT count(*) FROM public.freelance_assignments WHERE opportunity_id=o.id AND status NOT IN ('cancelado','reprovado'))>=o.slots THEN RAISE EXCEPTION 'Todas as posições já foram selecionadas'; END IF;
INSERT INTO public.freelance_assignments(opportunity_id,professional_id,company_id,starts_at,ends_at,status) VALUES(o.id,fa.professional_id,o.company_id,o.starts_at,o.ends_at,'convidado') RETURNING id INTO aid;
UPDATE public.freelance_applications SET status='selecionado' WHERE id=fa.id;
UPDATE public.freelance_opportunities SET status='selecionados' WHERE id=o.id AND status IN ('publicada','interessados'); RETURN aid; END $$;
CREATE OR REPLACE FUNCTION public.approve_freelance(_assignment_id uuid,_approve boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE a record; BEGIN
SELECT * INTO a FROM public.freelance_assignments WHERE id=_assignment_id FOR UPDATE;
IF NOT FOUND OR auth.uid() IS NULL OR NOT(public.is_company_member(auth.uid(),a.company_id) OR public.is_staff(auth.uid())) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
IF a.status<>'aguardando_aprovacao' THEN RAISE EXCEPTION 'Trabalho não aguarda aprovação'; END IF;
UPDATE public.freelance_assignments SET status=CASE WHEN _approve THEN 'aprovado'::public.assignment_status ELSE 'reprovado'::public.assignment_status END,approved_at=now(),approved_by=auth.uid() WHERE id=a.id;
IF NOT EXISTS(SELECT 1 FROM public.freelance_assignments WHERE opportunity_id=a.opportunity_id AND status NOT IN ('aprovado','reprovado','cancelado')) THEN UPDATE public.freelance_opportunities SET status='concluida' WHERE id=a.opportunity_id; END IF;
END $$;
REVOKE ALL ON FUNCTION public.approve_freelance(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.approve_freelance(uuid,boolean) TO authenticated;
CREATE OR REPLACE FUNCTION public.validate_review() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NEW.reviewer_id IS DISTINCT FROM auth.uid() OR NOT EXISTS(SELECT 1 FROM public.freelance_assignments a WHERE a.id=NEW.assignment_id AND a.professional_id=NEW.professional_id AND a.status='aprovado' AND (public.is_company_member(auth.uid(),a.company_id) OR public.is_staff(auth.uid()))) THEN RAISE EXCEPTION 'Avaliação não autorizada'; END IF; RETURN NEW; END $$;
CREATE TRIGGER validate_freelance_review BEFORE INSERT ON public.freelance_reviews FOR EACH ROW EXECUTE FUNCTION public.validate_review();
CREATE TRIGGER audit_stores AFTER INSERT OR UPDATE OR DELETE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER audit_talent AFTER INSERT OR UPDATE OR DELETE ON public.talent_pool FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();