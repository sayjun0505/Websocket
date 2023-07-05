import { NextFunction, Request, Response } from 'express'
import { OrganizationEntity } from 'src/model/organization'
import { ErrorCode, HttpException } from '../../../middleware/exceptions'

import { categories } from '../../../service/woocommerce'

export const getCategoriesListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    if(!organization ||
      !organization.woocommerceUrl ||
      !organization.woocommerceConsumerKey ||
      !organization.woocommerceConsumerSecret
    ){
      // console.error('Woocommerce setting not found')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const category = await categories.getAllCategoriesList(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret
    )
    if (!category) return next(new HttpException(400, ErrorCode[400]))
    return res.status(200).send(category)
  } catch (error) {
    // console.error(error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const getCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    if(!organization ||
      !organization.woocommerceUrl ||
      !organization.woocommerceConsumerKey ||
      !organization.woocommerceConsumerSecret
    ){
      // console.error('Woocommerce setting not found')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const id = String(req.query.id)
    if (!id) {
      // console.error('[Category] Invalid param (id) ', id)
      return next(new HttpException(400, ErrorCode[400]))
    }
    const category = await categories.getCategory(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,
      Number(id)
    )
    if (!category) return next(new HttpException(400, ErrorCode[400]))
    return res.status(200).send(category)
  } catch (error) {
    // console.error(error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  if(!organization ||
    !organization.woocommerceUrl ||
    !organization.woocommerceConsumerKey ||
    !organization.woocommerceConsumerSecret
  ){
    // console.error('Woocommerce setting not found')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const { category } = req.body
  if (!category) {
    // console.error('[category] Request body invalid')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    const result = await categories.createCategory(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,
      category
    )
    if (!result) {
      // console.error('[Category] error')
      return next(new HttpException(500, ErrorCode[500]))
    }
    // return res.status(201).send(result)
  } catch (error) {
    // console.error('[Category] Create category ', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  if(!organization ||
    !organization.woocommerceUrl ||
    !organization.woocommerceConsumerKey ||
    !organization.woocommerceConsumerSecret
  ){
    // console.error('Woocommerce setting not found')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const {category } = req.body
  if (!category) {
    // console.error('[Category] Request body invalid')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    // console.error('[Category] ', category)
    const result = await categories.updateCategory(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,
      category.id,
      category
    )
    if (!result) {
      // console.error('[Category] error')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(201).send(result)
  } catch (error) {
    // console.error('[Category] Update Category ', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    if(!organization ||
      !organization.woocommerceUrl ||
      !organization.woocommerceConsumerKey ||
      !organization.woocommerceConsumerSecret
    ){
      // console.error('Woocommerce setting not found')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const id = req.query.id
    // console.error('[Category] param (id) ', id)

    if (!id) {
      // console.error('[Category] Invalid param (id) ', id)
      return next(new HttpException(400, ErrorCode[400]))
    }
    const result = await categories.deleteCategory(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,
      Number(id))
    if (!result) {
      // console.error('[Category] error')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(201).send(result)
  } catch (error) {
    // console.error('[Category] Delete Category ', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}
