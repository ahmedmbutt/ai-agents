import { ApId, assertNotNullOrUndefined, CreateRbacRequestBody, Rbac, UpdateRbacRequestBody } from '@activepieces/shared'
import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { rbacService } from './rbac.service'

export const rbacController: FastifyPluginAsyncTypebox = async (app) => {

    app.get('/', {}, async (req) => {
        const platformId = req.principal.platform.id
        assertNotNullOrUndefined(platformId, 'platformId')

        return await rbacService.list(platformId)
    })

    app.post('/', CreateRbacRequest, async (req, reply) => {
        const result = await rbacService.create(req.body)
        return reply.code(StatusCodes.CREATED).send(result)
    })

    app.post('/:id', UpdateRbacRequest, async (req) => {
        return await rbacService.update(req.params.id, req.body)
    })

    app.delete('/:id', DeleteRbacRequest, async (req) => {
        return await rbacService.delete(req.params.id)
    })
}

const CreateRbacRequest = {
    schema: {
        body: CreateRbacRequestBody,
        response: {
            [StatusCodes.CREATED]: Rbac,
        },
    },
}

const UpdateRbacRequest = {
    schema: {
        body: UpdateRbacRequestBody,
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.OK]: Rbac,
        },
    },
}

const DeleteRbacRequest = {
    schema: {
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.NO_CONTENT]: Type.Null(),
        },
    },
}