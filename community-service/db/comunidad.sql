--
-- PostgreSQL database dump
--

\restrict V8pi7B7pSipFgwsnGmLnbluiZVLH2ujK8AKbpSjqEuIa0z3C35dob5N94wzH4QG

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

-- Started on 2026-11-03 09:07:30

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16388)
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16408)
-- Name: moderaciones_resenas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moderaciones_resenas (
    id integer NOT NULL,
    resena_id integer NOT NULL,
    administrador_id integer NOT NULL,
    motivo text NOT NULL,
    moderada_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_moderaciones_resenas_motivo CHECK ((length(TRIM(BOTH FROM motivo)) > 0))
);


--
-- TOC entry 220 (class 1259 OID 16407)
-- Name: moderaciones_resenas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.moderaciones_resenas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4837 (class 0 OID 0)
-- Dependencies: 220
-- Name: moderaciones_resenas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.moderaciones_resenas_id_seq OWNED BY public.moderaciones_resenas.id;


--
-- TOC entry 223 (class 1259 OID 16425)
-- Name: recompensas_modulos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recompensas_modulos (
    id integer NOT NULL,
    estudiante_id integer NOT NULL,
    modulo_id integer NOT NULL,
    puntos integer DEFAULT 10 NOT NULL,
    insignia character varying(100) NOT NULL,
    otorgada_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_recompensas_puntos CHECK ((puntos = 10))
);


--
-- TOC entry 222 (class 1259 OID 16424)
-- Name: recompensas_modulos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recompensas_modulos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4838 (class 0 OID 0)
-- Dependencies: 222
-- Name: recompensas_modulos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recompensas_modulos_id_seq OWNED BY public.recompensas_modulos.id;


--
-- TOC entry 219 (class 1259 OID 16394)
-- Name: resenas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resenas (
    id integer NOT NULL,
    curso_id integer NOT NULL,
    estudiante_id integer NOT NULL,
    calificacion integer NOT NULL,
    comentario text,
    oculta boolean DEFAULT false NOT NULL,
    creada_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_resenas_calificacion CHECK (((calificacion >= 1) AND (calificacion <= 5)))
);


--
-- TOC entry 218 (class 1259 OID 16393)
-- Name: resenas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resenas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4839 (class 0 OID 0)
-- Dependencies: 218
-- Name: resenas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resenas_id_seq OWNED BY public.resenas.id;


--
-- TOC entry 4658 (class 2604 OID 16411)
-- Name: moderaciones_resenas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderaciones_resenas ALTER COLUMN id SET DEFAULT nextval('public.moderaciones_resenas_id_seq'::regclass);


--
-- TOC entry 4660 (class 2604 OID 16428)
-- Name: recompensas_modulos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recompensas_modulos ALTER COLUMN id SET DEFAULT nextval('public.recompensas_modulos_id_seq'::regclass);


--
-- TOC entry 4655 (class 2604 OID 16397)
-- Name: resenas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resenas ALTER COLUMN id SET DEFAULT nextval('public.resenas_id_seq'::regclass);


--
-- TOC entry 4825 (class 0 OID 16388)
-- Dependencies: 217
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alembic_version (version_num) FROM stdin;
881f425e2b8c
\.


--
-- TOC entry 4829 (class 0 OID 16408)
-- Dependencies: 221
-- Data for Name: moderaciones_resenas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.moderaciones_resenas (id, resena_id, administrador_id, motivo, moderada_en) FROM stdin;
\.


--
-- TOC entry 4831 (class 0 OID 16425)
-- Dependencies: 223
-- Data for Name: recompensas_modulos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recompensas_modulos (id, estudiante_id, modulo_id, puntos, insignia, otorgada_en) FROM stdin;
\.


--
-- TOC entry 4827 (class 0 OID 16394)
-- Dependencies: 219
-- Data for Name: resenas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.resenas (id, curso_id, estudiante_id, calificacion, comentario, oculta, creada_en) FROM stdin;
\.


--
-- TOC entry 4840 (class 0 OID 0)
-- Dependencies: 220
-- Name: moderaciones_resenas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.moderaciones_resenas_id_seq', 1, false);


--
-- TOC entry 4841 (class 0 OID 0)
-- Dependencies: 222
-- Name: recompensas_modulos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recompensas_modulos_id_seq', 1, false);


--
-- TOC entry 4842 (class 0 OID 0)
-- Dependencies: 218
-- Name: resenas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.resenas_id_seq', 1, false);


--
-- TOC entry 4667 (class 2606 OID 16392)
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- TOC entry 4674 (class 2606 OID 16417)
-- Name: moderaciones_resenas moderaciones_resenas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderaciones_resenas
    ADD CONSTRAINT moderaciones_resenas_pkey PRIMARY KEY (id);


--
-- TOC entry 4676 (class 2606 OID 16433)
-- Name: recompensas_modulos recompensas_modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recompensas_modulos
    ADD CONSTRAINT recompensas_modulos_pkey PRIMARY KEY (id);


--
-- TOC entry 4671 (class 2606 OID 16404)
-- Name: resenas resenas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_pkey PRIMARY KEY (id);


--
-- TOC entry 4678 (class 2606 OID 16435)
-- Name: recompensas_modulos uq_recompensas_estudiante_modulo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recompensas_modulos
    ADD CONSTRAINT uq_recompensas_estudiante_modulo UNIQUE (estudiante_id, modulo_id);


--
-- TOC entry 4672 (class 1259 OID 16423)
-- Name: ix_moderaciones_resenas_resena_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_moderaciones_resenas_resena_id ON public.moderaciones_resenas USING btree (resena_id);


--
-- TOC entry 4668 (class 1259 OID 16405)
-- Name: ix_resenas_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_resenas_curso_id ON public.resenas USING btree (curso_id);


--
-- TOC entry 4669 (class 1259 OID 16406)
-- Name: ix_resenas_estudiante_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_resenas_estudiante_id ON public.resenas USING btree (estudiante_id);


--
-- TOC entry 4679 (class 2606 OID 16418)
-- Name: moderaciones_resenas fk_moderaciones_resenas_resena; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderaciones_resenas
    ADD CONSTRAINT fk_moderaciones_resenas_resena FOREIGN KEY (resena_id) REFERENCES public.resenas(id) ON DELETE RESTRICT;


-- Completed on 2026-11-03 09:07:31

--
-- PostgreSQL database dump complete
--

\unrestrict V8pi7B7pSipFgwsnGmLnbluiZVLH2ujK8AKbpSjqEuIa0z3C35dob5N94wzH4QG

