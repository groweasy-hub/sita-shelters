"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Tags } from "lucide-react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { MATERIAL_CATEGORY_TREE } from "@/lib/mock-data/material-categories";
import { useAllMaterials } from "../hooks/use-materials";

const Root = styled.div`
  display: grid;
  max-width: 72rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const CategoryCard = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const CategoryHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const CategoryTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
  svg {
    color: ${({ theme }) => theme.colors.accentForeground};
    width: 1rem;
    height: 1rem;
  }
`;
const SubcategoryList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;
const SubcategoryRow = styled.li`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;
const SubcategoryButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.foreground};
  font: inherit;
  text-align: left;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }
  svg {
    width: 1rem;
    height: 1rem;
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
`;
const SubcategoryMeta = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export function MaterialCategoriesScreen() {
  const router = useRouter();
  const { data: materials = [] } = useAllMaterials();
  const countsBySubcategory = useMemo(() => {
    const counts = new Map();
    materials.forEach((material) => {
      const key = `${material.category}:${material.subcategory}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [materials]);
  return (
    <Root>
      <PageHeader
        description="The category hierarchy every material, indent line and purchase order draws from."
        eyebrow="Material master"
        title="Material Categories"
      />
      <Grid>
        {MATERIAL_CATEGORY_TREE.map((category) => (
          <CategoryCard key={category.id}>
            <CategoryHeader>
              <CategoryTitle>
                <Tags aria-hidden="true" />
                {category.name}
              </CategoryTitle>
              <Badge variant="outline">
                {category.subcategories.length} subcategories
              </Badge>
            </CategoryHeader>
            <SubcategoryList>
              {category.subcategories.map((subcategory) => (
                <SubcategoryRow key={subcategory.id}>
                  <SubcategoryButton
                    onClick={() =>
                      router.push(`/materials?category=${category.id}`)
                    }
                    type="button"
                  >
                    <span>{subcategory.name}</span>
                    <SubcategoryMeta>
                      <Badge variant="muted">
                        {countsBySubcategory.get(
                          `${category.id}:${subcategory.id}`,
                        ) ?? 0}{" "}
                        materials
                      </Badge>
                      <ChevronRight aria-hidden="true" />
                    </SubcategoryMeta>
                  </SubcategoryButton>
                </SubcategoryRow>
              ))}
            </SubcategoryList>
          </CategoryCard>
        ))}
      </Grid>
    </Root>
  );
}
