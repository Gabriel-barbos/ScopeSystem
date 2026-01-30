import Service from "../models/Service.js";
import Schedule from "../models/Schedule.js";

class ServiceController {
  // Criar serviço a partir de validação
  async createFromValidation(req, res) {
    try {
      const { scheduleId, validationData } = req.body;

      const schedule = await Schedule.findById(scheduleId)
        .populate("client")
        .populate("product");

      if (!schedule) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      const service = await Service.create({
        plate: schedule.plate,
        vin: schedule.vin,
        model: schedule.model,
        scheduledDate: schedule.scheduledDate,
        serviceType: schedule.serviceType,
        notes: schedule.notes,
        createdBy: schedule.createdBy,
        product: schedule.product,
        client: schedule.client,

        deviceId: validationData.deviceId,
        technician: validationData.technician,
        installationLocation: validationData.installationLocation,
        serviceAddress: validationData.serviceAddress,
        odometer: validationData.odometer,
        blockingEnabled: validationData.blockingEnabled,
        protocolNumber: validationData.protocolNumber,
        validationNotes: validationData.validationNotes,
        secondaryDevice: validationData.secondaryDevice,
        validatedBy: validationData.validatedBy,
        validatedAt: new Date(),

        schedule: scheduleId,
        source: "validation"
      });

      await Schedule.findByIdAndUpdate(scheduleId, {
        status: "concluido",
        service: service._id
      });

      return res.status(201).json(service);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Criar serviço direto 
  async create(req, res) {
    try {
      const service = await Service.create({
        ...req.body,
        source: "import",
        validatedAt: new Date()
      });

      return res.status(201).json(service);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Importação em lote
  async bulkImport(req, res) {
    try {
      const { services } = req.body;

      const created = await Service.insertMany(
        services.map(s => ({
          ...s,
          source: "import",
          validatedAt: new Date()
        }))
      );

      return res.status(201).json({
        success: true,
        count: created.length,
        message: `${created.length} serviço(s) importado(s)`
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Listar serviços
  async list(req, res) {
    try {
      const services = await Service.find()
        .populate("client", "name image")
        .populate("product", "name")
        .sort({ createdAt: -1 });

      return res.json(services);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Buscar por ID
  async findById(req, res) {
    try {
      const service = await Service.findById(req.params.id)
        .populate("client")
        .populate("product")
        .populate("schedule");

      if (!service) {
        return res.status(404).json({ error: "Serviço não encontrado" });
      }

      return res.json(service);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Atualizar serviço 
  async update(req, res) {
    try {
      const forbiddenFields = ["schedule", "source", "validatedAt"];

      forbiddenFields.forEach(field => delete req.body[field]);

      const service = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!service) {
        return res.status(404).json({ error: "Serviço não encontrado" });
      }

      return res.json(service);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Excluir serviço
  async remove(req, res) {
    try {
      const service = await Service.findByIdAndDelete(req.params.id);

      if (!service) {
        return res.status(404).json({ error: "Serviço não encontrado" });
      }

      return res.json({ message: "Serviço removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new ServiceController();
