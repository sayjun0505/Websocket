import { NextFunction, Request, Response } from 'express'
import { OrganizationEntity } from 'src/model/organization'
import { ErrorCode, HttpException } from '../../../middleware/exceptions'

import { products } from '../../../service/woocommerce'

export const getProductsListController = async (
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
      console.error('Woocommerce setting not found')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const product = await products.getAllProductList(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,)
    if (!product) return next(new HttpException(400, ErrorCode[400]))
    return res.status(200).send(product)
  } catch (error) {
    console.error(error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const getProductController = async (
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
      console.error('Woocommerce setting not found')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const id = String(req.query.id)
    if (!id) {
      console.error('[Product] Invalid param (id) ', id)
      return next(new HttpException(400, ErrorCode[400]))
    }
    const product = await products.getProduct(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,
      Number(id)
    )
    if (!product) return next(new HttpException(400, ErrorCode[400]))
    return res.status(200).send(product)
  } catch (error) {
    console.error(error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const createProductController = async (
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
      console.error('Woocommerce setting not found')
      return next(new HttpException(400, ErrorCode[400]))
    }
  const { product } = req.body
  if (!product) {
    console.error('[Product] Request body invalid')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    const result = await products.createProduct(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,
      product
    )
    if (!result) {
      console.error('[Product] error')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(201).send(result)
  } catch (error) {
    console.error('[Product] Create Product ', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const updateProductController = async (
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
    console.error('Woocommerce setting not found')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const {product } = req.body
  if (!product) {
    console.error('[Product] Request body invalid')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    console.error('[Product] ', product)
    const result = await products.updateProduct(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,
      product.id,
      product
    )
    if (!result) {
      console.error('[Product] error')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(201).send(result)
  } catch (error) {
    console.error('[Product] Update Product ', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const deleteProductController = async (
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
      console.error('Woocommerce setting not found')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const id = req.query.id
    console.error('[Product] param (id) ', id)

    if (!id) {
      console.error('[Product] Invalid param (id) ', id)
      return next(new HttpException(400, ErrorCode[400]))
    }
    const result = await products.deleteProduct(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,
      Number(id))
    if (!result) {
      console.error('[Product] error')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(201).send(result)
  } catch (error) {
    console.error('[Product] Delete Product ', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}
