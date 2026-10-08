DROP POLICY "stores read" ON public.stores;
CREATE POLICY "stores scoped read" ON public.stores FOR SELECT TO authenticated USING(public.is_company_member(auth.uid(),company_id) OR public.is_staff(auth.uid()));
CREATE POLICY "stores staff write" ON public.stores FOR ALL TO authenticated USING(public.is_staff(auth.uid())) WITH CHECK(public.is_staff(auth.uid()));